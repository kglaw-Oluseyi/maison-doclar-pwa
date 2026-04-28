import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      eventId: true,
      accessToken: true,
      name: true,
      email: true,
      rsvpStatus: true,
      rsvpDetails: true,
      tags: true,
      tableNumber: true,
      dietaryNotes: true,
      specialNotes: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({
    guests: guests.map((g) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    })),
  })
}

