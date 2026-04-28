'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { requireHostEvent } from '@/app/api/host/[slug]/_utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  const scoped = await requireHostEvent(request, slug)
  if (!scoped.ok) return scoped.response

  const guests = await prisma.guest.findMany({
    where: { eventId: scoped.event.id },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      rsvpStatus: true,
      rsvpDetails: true,
      tableNumber: true,
      tags: true,
      dietaryNotes: true,
      specialNotes: true,
      createdAt: true,
      checkIn: { select: { scannedAt: true, method: true } },
      accessCard: { select: { releasedAt: true } },
      guestRequests: { select: { type: true, status: true } },
    },
  })

  return NextResponse.json({
    guests: guests.map((g) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      checkIn: g.checkIn ? { scannedAt: g.checkIn.scannedAt.toISOString(), method: g.checkIn.method } : null,
      accessCard: g.accessCard ? { releasedAt: g.accessCard.releasedAt?.toISOString() ?? null } : null,
    })),
  })
}

