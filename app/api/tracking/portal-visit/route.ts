'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export async function POST(request: NextRequest) {
  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return NextResponse.json({ ok: true })
  const token = bodyRaw.token
  if (typeof token !== 'string' || token.length === 0) return NextResponse.json({ ok: true })

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token },
    select: { id: true, eventId: true, portalFirstVisitedAt: true },
  })
  if (!guest) return NextResponse.json({ ok: true })

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
  const recent = await prisma.communicationLog.findFirst({
    where: { guestId: guest.id, type: 'PORTAL_VISITED', createdAt: { gte: fiveMinAgo } },
    select: { id: true },
  })
  if (recent) return NextResponse.json({ ok: true })

  const now = new Date()
  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      portalFirstVisitedAt: guest.portalFirstVisitedAt ? undefined : now,
      portalVisitCount: { increment: 1 },
    },
  })

  await prisma.communicationLog.create({
    data: {
      guestId: guest.id,
      eventId: guest.eventId,
      type: 'PORTAL_VISITED',
      channel: null,
      summary: 'Portal visited',
      metadata: {},
    },
  })

  return NextResponse.json({ ok: true })
}

