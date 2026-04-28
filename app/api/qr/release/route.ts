import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  await requireDashboardSession(request)

  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)
  }

  const record = body as Record<string, unknown>
  const eventId = record.eventId
  const guestId = record.guestId

  if (typeof eventId !== 'string' || eventId.length === 0) {
    return apiError('eventId is required', 'MISSING_EVENT_ID', 400)
  }

  const now = new Date()

  if (typeof guestId === 'string' && guestId.length > 0) {
    const res = await prisma.accessCard.updateMany({
      where: { eventId, guestId, releasedAt: null, invalidatedAt: null },
      data: { releasedAt: now },
    })
    return NextResponse.json({ ok: true, released: res.count })
  }

  const res = await prisma.accessCard.updateMany({
    where: { eventId, releasedAt: null, invalidatedAt: null },
    data: { releasedAt: now },
  })

  return NextResponse.json({ ok: true, released: res.count })
}

