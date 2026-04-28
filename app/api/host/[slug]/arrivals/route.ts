'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { requireHostEvent } from '@/app/api/host/[slug]/_utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  const scoped = await requireHostEvent(request, slug)
  if (!scoped.ok) return scoped.response

  const arrivals = await prisma.checkInLog.findMany({
    where: { eventId: scoped.event.id },
    orderBy: { scannedAt: 'desc' },
    take: 20,
    select: {
      scannedAt: true,
      method: true,
      guest: { select: { name: true, tableNumber: true, tags: true } },
    },
  })

  return NextResponse.json({
    arrivals: arrivals.map((a) => ({
      guestName: a.guest.name,
      scannedAt: a.scannedAt.toISOString(),
      method: a.method,
      tableNumber: a.guest.tableNumber,
      tags: a.guest.tags,
    })),
  })
}

