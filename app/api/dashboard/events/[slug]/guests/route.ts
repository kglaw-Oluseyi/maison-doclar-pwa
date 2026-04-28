import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

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
      id: true,
      eventId: true,
      accessToken: true,
      name: true,
      email: true,
      rsvpStatus: true,
      rsvpDetails: true,
      tags: true,
      tableNumber: true,
      dietaryNotes: true,
      specialNotes: true,
      accessibilityNotes: true,
      invitedAt: true,
      invitationChannel: true,
      portalVisitCount: true,
      portalFirstVisitedAt: true,
      groupId: true,
      isPa: true,
      managedGuestId: true,
      accessCard: { select: { id: true, releasedAt: true, invalidatedAt: true } },
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({
    guests: guests.map((g) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
      invitedAt: g.invitedAt?.toISOString() ?? null,
      portalFirstVisitedAt: g.portalFirstVisitedAt?.toISOString() ?? null,
      accessCard: g.accessCard
        ? { ...g.accessCard, releasedAt: g.accessCard.releasedAt?.toISOString() ?? null, invalidatedAt: g.accessCard.invalidatedAt?.toISOString() ?? null }
        : null,
    })),
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
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

  const name = typeof bodyRaw.name === 'string' ? bodyRaw.name.trim() : ''
  if (!name) return apiError('Name is required', 'MISSING_NAME', 400)
  const email = typeof bodyRaw.email === 'string' ? bodyRaw.email.trim() : ''
  const tableNumber = typeof bodyRaw.tableNumber === 'string' ? bodyRaw.tableNumber.trim() : ''
  const tags =
    typeof bodyRaw.tags === 'string'
      ? bodyRaw.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []
  const dietaryNotes = typeof bodyRaw.dietaryNotes === 'string' ? bodyRaw.dietaryNotes.trim() : ''
  const accessibilityNotes = typeof bodyRaw.accessibilityNotes === 'string' ? bodyRaw.accessibilityNotes.trim() : ''

  const created = await prisma.guest.create({
    data: {
      eventId: event.id,
      name,
      email: email || null,
      tableNumber: tableNumber || null,
      tags,
      dietaryNotes: dietaryNotes || null,
      accessibilityNotes: accessibilityNotes || null,
      rsvpDetails: {},
    },
    select: { id: true, eventId: true },
  })

  await prisma.accessCard.create({
    data: {
      eventId: created.eventId,
      guestId: created.id,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: created.id })
}

