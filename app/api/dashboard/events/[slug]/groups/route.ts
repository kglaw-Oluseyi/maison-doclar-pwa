'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
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

  const groups = await prisma.guestGroup.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, maxSize: true, overflowMessage: true, createdAt: true },
  })
  const counts = await prisma.guest.groupBy({
    by: ['groupId'],
    where: { eventId: event.id, groupId: { not: null } },
    _count: { _all: true },
  })
  const countMap = new Map<string, number>()
  for (const c of counts) if (c.groupId) countMap.set(c.groupId, c._count._all)

  return NextResponse.json({
    groups: groups.map((g) => ({
      ...g,
      createdAtISO: g.createdAt.toISOString(),
      memberCount: countMap.get(g.id) ?? 0,
    })),
  })
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
  const maxSize = typeof bodyRaw.maxSize === 'number' ? bodyRaw.maxSize : Number(bodyRaw.maxSize)
  const overflowMessage =
    typeof bodyRaw.overflowMessage === 'string'
      ? bodyRaw.overflowMessage
      : 'Need to add more guests? Send us a message through the app.'
  if (!name) return apiError('Name is required', 'MISSING_NAME', 400)
  if (!Number.isFinite(maxSize) || maxSize < 1 || maxSize > 50) return apiError('Invalid max size', 'INVALID_MAX', 400)

  const g = await prisma.guestGroup.create({
    data: { eventId: event.id, name, maxSize: Math.floor(maxSize), overflowMessage },
    select: { id: true },
  })
  return NextResponse.json({ ok: true, id: g.id })
}

