'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

function utcDateStamp(now: Date): string {
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function sanitizeFilenameComponent(value: string): string {
  const cleaned = value.replaceAll(/[^a-zA-Z0-9._-]/g, '-').replaceAll(/-+/g, '-')
  return cleaned.length === 0 ? 'event' : cleaned
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function escapeField(value: string | null | undefined): string {
  const raw = value ?? ''
  const needsQuotes = raw.includes(',') || raw.includes('"') || raw.includes('\n') || raw.includes('\r')
  const escaped = raw.replaceAll('"', '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, featureFlags: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const flags = asRecord(event.featureFlags)
  if (flags.accessibilityExportEnabled !== true) return apiError('Accessibility export disabled', 'FEATURE_DISABLED', 409)

  const guests = await prisma.guest.findMany({
    where: {
      eventId: event.id,
      OR: [{ accessibilityNotes: { not: null } }, { specialNotes: { not: null } }],
    },
    orderBy: [{ tableNumber: 'asc' }, { name: 'asc' }],
    select: {
      name: true,
      tableNumber: true,
      accessibilityNotes: true,
      specialNotes: true,
      tags: true,
    },
  })

  const header = ['Guest Name', 'Table Number', 'Accessibility Notes', 'Special Notes', 'Tags'].join(',')
  const rows = guests.map((g) => {
    const tags = g.tags.join('; ')
    return [
      escapeField(g.name),
      escapeField(g.tableNumber ?? ''),
      escapeField(g.accessibilityNotes ?? ''),
      escapeField(g.specialNotes ?? ''),
      escapeField(tags),
    ].join(',')
  })
  const csv = [header, ...rows, ''].join('\n')

  const safeSlug = sanitizeFilenameComponent(slug)
  const stamp = utcDateStamp(new Date())
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeSlug}-accessibility-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

