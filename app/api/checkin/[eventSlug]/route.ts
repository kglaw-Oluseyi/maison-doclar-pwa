import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { eventSlug: string } }) {
  await requireDashboardSession(request)

  const event = await prisma.event.findUnique({
    where: { slug: params.eventSlug },
    select: { id: true, name: true, slug: true },
  })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      rsvpStatus: true,
      tableNumber: true,
      dietaryNotes: true,
      specialNotes: true,
      tags: true,
      checkIn: { select: { scannedAt: true, method: true } },
      accessCard: { select: { releasedAt: true, invalidatedAt: true, qrToken: true } },
    },
  })

  const total = guests.length
  const declined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length
  const arrived = guests.filter((g) => g.checkIn !== null).length
  const notArrived = total - arrived - declined

  return NextResponse.json({
    event,
    stats: {
      total,
      arrived,
      notArrived,
      declined,
    },
    guests: guests.map((g) => ({
      id: g.id,
      name: g.name,
      rsvpStatus: g.rsvpStatus,
      tableNumber: g.tableNumber,
      dietaryNotes: g.dietaryNotes,
      specialNotes: g.specialNotes,
      tags: g.tags,
      checkIn: g.checkIn ? { scannedAt: g.checkIn.scannedAt.toISOString(), method: g.checkIn.method } : null,
      accessCard: g.accessCard
        ? {
            releasedAt: g.accessCard.releasedAt ? g.accessCard.releasedAt.toISOString() : null,
            invalidatedAt: g.accessCard.invalidatedAt ? g.accessCard.invalidatedAt.toISOString() : null,
            qrToken: g.accessCard.qrToken,
          }
        : null,
    })),
  })
}

