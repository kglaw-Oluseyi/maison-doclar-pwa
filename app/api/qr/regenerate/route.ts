import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'
import { generateQrToken } from '@/lib/qr'
import { logCommunication } from '@/lib/communication-log'

export async function POST(request: NextRequest) {
  await requireDashboardSession(request)

  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)
  }

  const record = body as Record<string, unknown>
  const guestId = record.guestId
  const performedBy = record.performedBy

  if (typeof guestId !== 'string' || guestId.length === 0) {
    return apiError('guestId is required', 'MISSING_GUEST_ID', 400)
  }

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { id: true, eventId: true },
  })
  if (!guest) return apiError('Guest not found', 'GUEST_NOT_FOUND', 404)

  const now = new Date()
  const newToken = generateQrToken()

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.accessCard.findUnique({
      where: { guestId: guest.id },
      select: { id: true, qrToken: true },
    })

    const oldQrToken = existing?.qrToken ?? null

    const card = await tx.accessCard.upsert({
      where: { guestId: guest.id },
      update: {
        qrToken: newToken,
        regeneratedAt: now,
        invalidatedAt: null,
      },
      create: {
        guestId: guest.id,
        eventId: guest.eventId,
        qrToken: newToken,
        generatedAt: now,
        releasedAt: null,
      },
      select: {
        id: true,
        guestId: true,
        eventId: true,
        qrToken: true,
        generatedAt: true,
        regeneratedAt: true,
        invalidatedAt: true,
        releasedAt: true,
      },
    })

    await tx.qrAuditLog.create({
      data: {
        guestId: guest.id,
        eventId: guest.eventId,
        action: 'REGENERATED',
        performedBy: typeof performedBy === 'string' ? performedBy : null,
        oldQrToken,
        newQrToken: newToken,
      },
    })

    return card
  })

  try {
    void logCommunication({
      guestId: result.guestId,
      eventId: result.eventId,
      type: 'QR_REGENERATED',
      channel: typeof performedBy === 'string' ? 'DASHBOARD' : undefined,
      summary: 'QR token regenerated',
      metadata: { performedBy: typeof performedBy === 'string' ? performedBy : null },
    })
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true, card: { ...result, generatedAt: result.generatedAt.toISOString(), regeneratedAt: result.regeneratedAt?.toISOString() ?? null, invalidatedAt: result.invalidatedAt?.toISOString() ?? null, releasedAt: result.releasedAt?.toISOString() ?? null } })
}

