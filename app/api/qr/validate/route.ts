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
  const qrToken = record.qrToken
  const scannedBy = record.scannedBy

  if (!qrToken || typeof qrToken !== 'string') {
    return apiError('QR token is required', 'MISSING_TOKEN', 400)
  }

  const card = await prisma.accessCard.findUnique({
    where: { qrToken },
    include: {
      guest: {
        select: {
          id: true,
          name: true,
          tableNumber: true,
          dietaryNotes: true,
          specialNotes: true,
          tags: true,
          rsvpStatus: true,
        },
      },
      event: {
        select: { id: true, slug: true, name: true },
      },
      checkIn: true,
    },
  })

  if (!card) {
    return NextResponse.json({
      result: 'INVALID',
      message: 'This pass is not recognised.',
    })
  }

  if (card.invalidatedAt) {
    return NextResponse.json({
      result: 'INVALID',
      message: 'This pass has been invalidated. Please request a new one.',
    })
  }

  if (card.checkIn) {
    return NextResponse.json({
      result: 'DUPLICATE',
      message: 'Already checked in.',
      checkedInAt: card.checkIn.scannedAt.toISOString(),
      guest: card.guest,
    })
  }

  const checkIn = await prisma.checkInLog.create({
    data: {
      guestId: card.guestId,
      accessCardId: card.id,
      eventId: card.eventId,
      scannedBy: typeof scannedBy === 'string' ? scannedBy : null,
      method: 'QR_SCAN',
    },
  })

  return NextResponse.json({
    result: 'SUCCESS',
    message: 'Welcome.',
    checkedInAt: checkIn.scannedAt.toISOString(),
    guest: card.guest,
  })
}

