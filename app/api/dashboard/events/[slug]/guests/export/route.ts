import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { generateGuestCSV } from '@/lib/csv'
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

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      email: true,
      rsvpStatus: true,
      tableNumber: true,
      dietaryNotes: true,
      specialNotes: true,
      tags: true,
      createdAt: true,
    },
  })

  const csv = generateGuestCSV(
    guests.map((g) => ({
      name: g.name,
      email: g.email,
      rsvpStatus: g.rsvpStatus,
      tableNumber: g.tableNumber,
      dietaryNotes: g.dietaryNotes,
      specialNotes: g.specialNotes,
      tags: g.tags,
      createdAt: g.createdAt,
    })),
  )

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

