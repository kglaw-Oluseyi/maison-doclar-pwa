'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function escapeField(value: string): string {
  const needs = value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')
  const escaped = value.replaceAll('"', '""')
  return needs ? `"${escaped}"` : escaped
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)

  // New client-side flow: send mapped guest objects directly.
  const guestsPayload = Array.isArray((bodyRaw as any).guests) ? ((bodyRaw as any).guests as unknown[]) : null
  const headers = Array.isArray(bodyRaw.headers) ? bodyRaw.headers.filter((h) => typeof h === 'string') : []
  const mapping = isRecord(bodyRaw.mapping) ? (bodyRaw.mapping as Record<string, string>) : {}
  const rows = Array.isArray(bodyRaw.rows) ? (bodyRaw.rows as unknown[]) : []

  if (!guestsPayload && (!headers.length || !rows.length)) return apiError('Missing CSV data', 'MISSING_CSV', 400)
  if (!guestsPayload) {
    const mappedNameCols = Object.entries(mapping).filter(([, v]) => v === 'name').map(([k]) => k)
    if (!mappedNameCols.length) return apiError('Name mapping required', 'MISSING_NAME_MAPPING', 400)
  }

  let created = 0
  let updated = 0
  let skipped = 0
  const errorLines: string[] = []
  errorLines.push(['Row', 'Error'].join(','))

  const toMappedObject = (i: number): { rowNumber: number; obj: Record<string, string> } => {
    if (guestsPayload) {
      const raw = guestsPayload[i]
      const obj: Record<string, string> = {}
      if (isRecord(raw)) {
        for (const [k, v] of Object.entries(raw)) obj[k] = typeof v === 'string' ? v : String(v ?? '')
      }
      return { rowNumber: i + 2, obj }
    }
    const r = rows[i]
    if (!Array.isArray(r)) return { rowNumber: i + 2, obj: {} }
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      const field = mapping[h]
      if (!field) return
      obj[field] = typeof r[idx] === 'string' ? r[idx] : String(r[idx] ?? '')
    })
    return { rowNumber: i + 2, obj }
  }

  const total = guestsPayload ? guestsPayload.length : rows.length
  for (let i = 0; i < total; i++) {
    const { rowNumber, obj } = toMappedObject(i)

    const name = (obj.name ?? '').trim()
    if (!name) {
      skipped++
      errorLines.push([String(rowNumber), escapeField('Missing name')].join(','))
      continue
    }
    const email = (obj.email ?? '').trim()
    const tableNumber = (obj.tableNumber ?? '').trim()
    const tags = (obj.tags ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const dietaryNotes = (obj.dietaryNotes ?? '').trim()
    const accessibilityNotes = (obj.accessibilityNotes ?? '').trim()
    const specialNotes = (obj.specialNotes ?? '').trim()
    const invitationChannel = (obj.invitationChannel ?? '').trim().toUpperCase()

    const data: Prisma.GuestUncheckedCreateInput = {
      eventId: event.id,
      name,
      email: email || null,
      tableNumber: tableNumber || null,
      tags,
      dietaryNotes: dietaryNotes || null,
      accessibilityNotes: accessibilityNotes || null,
      specialNotes: specialNotes || null,
      invitedAt: invitationChannel ? new Date() : null,
      invitationChannel:
        invitationChannel === 'WHATSAPP' || invitationChannel === 'EMAIL' || invitationChannel === 'MANUAL'
          ? (invitationChannel as any)
          : null,
      rsvpDetails: {},
    }

    try {
      if (email) {
        const existing = await prisma.guest.findFirst({ where: { eventId: event.id, email }, select: { id: true } })
        if (existing) {
          await prisma.guest.update({ where: { id: existing.id }, data })
          updated++
          continue
        }
      }

      const g = await prisma.guest.create({ data, select: { id: true } })
      await prisma.accessCard.create({ data: { eventId: event.id, guestId: g.id }, select: { id: true } })
      created++
    } catch (e: any) {
      skipped++
      errorLines.push([String(rowNumber), escapeField(typeof e?.message === 'string' ? e.message : 'Failed')].join(','))
    }
  }

  const errorsCsv = errorLines.length > 1 ? errorLines.join('\n') + '\n' : undefined
  return NextResponse.json({ created, updated, skipped, errorsCsv })
}

