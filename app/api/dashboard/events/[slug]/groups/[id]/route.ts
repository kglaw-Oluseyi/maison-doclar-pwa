'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const group = await prisma.guestGroup.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!group || group.eventId !== event.id) return apiError('Group not found', 'GROUP_NOT_FOUND', 404)

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)
  const data: any = {}
  if (typeof bodyRaw.name === 'string') data.name = bodyRaw.name.trim()
  if (bodyRaw.maxSize !== undefined) {
    const maxSize = typeof bodyRaw.maxSize === 'number' ? bodyRaw.maxSize : Number(bodyRaw.maxSize)
    if (!Number.isFinite(maxSize) || maxSize < 1 || maxSize > 50) return apiError('Invalid max size', 'INVALID_MAX', 400)
    data.maxSize = Math.floor(maxSize)
  }
  if (typeof bodyRaw.overflowMessage === 'string') data.overflowMessage = bodyRaw.overflowMessage

  await prisma.guestGroup.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const group = await prisma.guestGroup.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!group || group.eventId !== event.id) return apiError('Group not found', 'GROUP_NOT_FOUND', 404)

  await prisma.$transaction(async (tx) => {
    await tx.guest.updateMany({ where: { groupId: id }, data: { groupId: null } })
    await tx.guestGroup.delete({ where: { id } })
  })
  return NextResponse.json({ ok: true })
}

