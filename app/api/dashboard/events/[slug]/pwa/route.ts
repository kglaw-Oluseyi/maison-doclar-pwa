'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)
  const installHeadline = typeof bodyRaw.installHeadline === 'string' ? bodyRaw.installHeadline : null
  const installBody = typeof bodyRaw.installBody === 'string' ? bodyRaw.installBody : null
  if (!installHeadline || !installBody) return apiError('Missing fields', 'MISSING_FIELDS', 400)

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  await prisma.pwaConfig.upsert({
    where: { eventId: event.id },
    update: { installHeadline, installBody },
    create: { eventId: event.id, installHeadline, installBody },
  })

  return NextResponse.json({ ok: true })
}

