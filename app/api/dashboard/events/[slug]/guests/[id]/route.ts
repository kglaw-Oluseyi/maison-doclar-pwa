'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
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

  const existing = await prisma.guest.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!existing || existing.eventId !== event.id) return apiError('Guest not found', 'GUEST_NOT_FOUND', 404)

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)

  const data: any = {}
  if (typeof bodyRaw.name === 'string') data.name = bodyRaw.name.trim()
  if (bodyRaw.email === null) data.email = null
  if (typeof bodyRaw.email === 'string') data.email = bodyRaw.email.trim() || null
  if (bodyRaw.tableNumber === null) data.tableNumber = null
  if (typeof bodyRaw.tableNumber === 'string') data.tableNumber = bodyRaw.tableNumber.trim() || null
  if (typeof bodyRaw.tags === 'string') {
    data.tags = bodyRaw.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean)
  }
  if (bodyRaw.dietaryNotes === null) data.dietaryNotes = null
  if (typeof bodyRaw.dietaryNotes === 'string') data.dietaryNotes = bodyRaw.dietaryNotes.trim() || null
  if (bodyRaw.accessibilityNotes === null) data.accessibilityNotes = null
  if (typeof bodyRaw.accessibilityNotes === 'string') data.accessibilityNotes = bodyRaw.accessibilityNotes.trim() || null
  if (bodyRaw.invitedAt === null) data.invitedAt = null
  if (typeof bodyRaw.invitedAt === 'string') data.invitedAt = new Date(bodyRaw.invitedAt)
  if (bodyRaw.invitationChannel === null) data.invitationChannel = null
  if (typeof bodyRaw.invitationChannel === 'string') data.invitationChannel = bodyRaw.invitationChannel
  if (typeof bodyRaw.groupId === 'string') data.groupId = bodyRaw.groupId
  if (bodyRaw.groupId === null) data.groupId = null
  if (typeof bodyRaw.isPa === 'boolean') data.isPa = bodyRaw.isPa
  if (typeof bodyRaw.managedGuestId === 'string') data.managedGuestId = bodyRaw.managedGuestId
  if (bodyRaw.managedGuestId === null) data.managedGuestId = null

  await prisma.guest.update({ where: { id }, data })
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

  const existing = await prisma.guest.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!existing || existing.eventId !== event.id) return apiError('Guest not found', 'GUEST_NOT_FOUND', 404)

  await prisma.$transaction(async (tx) => {
    await tx.accessCard.deleteMany({ where: { guestId: id } })
    await tx.communicationLog.deleteMany({ where: { guestId: id } })
    await tx.feedbackResponse.deleteMany({ where: { guestId: id } })
    await tx.reminderReceipt.deleteMany({ where: { guestId: id } })
    await tx.guestRequest.deleteMany({ where: { guestId: id } })
    await tx.checkInLog.deleteMany({ where: { guestId: id } })
    await tx.guest.delete({ where: { id } })
  })

  return NextResponse.json({ ok: true })
}

