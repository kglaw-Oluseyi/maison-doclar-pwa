'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { requireHostEvent } from '@/app/api/host/[slug]/_utils'
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

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function toCSV(rows: string[][]): string {
  return rows.map((r) => r.map((c) => csvEscape(c)).join(',')).join('\n')
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  const scoped = await requireHostEvent(request, slug)
  if (!scoped.ok) return scoped.response

  const guests = await prisma.guest.findMany({
    where: { eventId: scoped.event.id },
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      email: true,
      rsvpStatus: true,
      rsvpDetails: true,
      tableNumber: true,
      dietaryNotes: true,
      specialNotes: true,
      tags: true,
      createdAt: true,
      checkIn: { select: { scannedAt: true, method: true } },
      guestRequests: { select: { status: true } },
    },
  })

  const header = [
    'Name',
    'Email',
    'RSVP Status',
    'Table Number',
    'Tags',
    'Dietary Notes',
    'Special Notes',
    'Plus One Name',
    'Dietary Requirements (RSVP)',
    'Message (RSVP)',
    'Check-in Time',
    'Check-in Method',
    'Pending Requests',
    'Created',
  ]

  const rows = guests.map((g) => {
    const details = asRecord(g.rsvpDetails)
    const plusOneName = typeof details.plusOneName === 'string' ? details.plusOneName : ''
    const dietaryReq = typeof details.dietaryRequirements === 'string' ? details.dietaryRequirements : ''
    const message = typeof details.message === 'string' ? details.message : ''
    const pendingRequests = g.guestRequests.filter((r) => r.status === 'PENDING').length

    return [
      g.name,
      g.email ?? '',
      g.rsvpStatus,
      g.tableNumber ?? '',
      g.tags.join(' | '),
      g.dietaryNotes ?? '',
      g.specialNotes ?? '',
      plusOneName,
      dietaryReq,
      message,
      g.checkIn ? g.checkIn.scannedAt.toISOString() : '',
      g.checkIn ? g.checkIn.method : '',
      String(pendingRequests),
      g.createdAt.toISOString(),
    ]
  })

  const csv = toCSV([header, ...rows])

  const safeSlug = sanitizeFilenameComponent(slug)
  const stamp = utcDateStamp(new Date())
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeSlug}-guests-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

