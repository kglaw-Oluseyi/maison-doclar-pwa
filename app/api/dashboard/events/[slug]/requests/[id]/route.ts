'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'
import { logCommunication } from '@/lib/communication-log'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const STATUS = new Set(['PENDING', 'ACKNOWLEDGED', 'RESOLVED'] as const)

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await context.params

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

  const status = bodyRaw.status
  const operatorNote = bodyRaw.operatorNote
  if (typeof status !== 'string' || !STATUS.has(status as any)) return apiError('Invalid status', 'INVALID_STATUS', 400)
  if (operatorNote !== undefined && operatorNote !== null && typeof operatorNote !== 'string') {
    return apiError('Invalid operatorNote', 'INVALID_OPERATOR_NOTE', 400)
  }

  const existing = await prisma.guestRequest.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!existing) return apiError('Request not found', 'REQUEST_NOT_FOUND', 404)
  if (existing.eventId !== event.id) return apiError('Not found', 'REQUEST_NOT_FOUND', 404)

  const updated = await prisma.guestRequest.update({
    where: { id },
    data: {
      status: status as any,
      operatorNote: typeof operatorNote === 'string' ? operatorNote : operatorNote === null ? null : undefined,
    },
    select: {
      id: true,
      type: true,
      message: true,
      status: true,
      operatorNote: true,
      createdAt: true,
      updatedAt: true,
      guest: { select: { id: true, name: true, email: true } },
    },
  })

  if (updated.status === 'ACKNOWLEDGED' || updated.status === 'RESOLVED') {
    try {
      void logCommunication({
        guestId: updated.guest.id,
        eventId: event.id,
        type: updated.status === 'ACKNOWLEDGED' ? 'REQUEST_ACKNOWLEDGED' : 'REQUEST_RESOLVED',
        channel: 'DASHBOARD',
        summary: `Request status updated to ${updated.status}`,
        metadata: { requestId: updated.id, status: updated.status },
      })
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    id: updated.id,
    type: updated.type,
    message: updated.message,
    status: updated.status,
    operatorNote: updated.operatorNote,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    guest: updated.guest,
  })
}

