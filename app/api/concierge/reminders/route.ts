'use server'

import { NextResponse, type NextRequest } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const eventSlug = request.nextUrl.searchParams.get('eventSlug')
  if (!token) return apiError('Missing token', 'MISSING_TOKEN', 400)
  if (!eventSlug) return apiError('Missing eventSlug', 'MISSING_EVENT_SLUG', 400)

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token, event: { slug: eventSlug } },
    select: { id: true, event: { select: { id: true } } },
  })

  if (!guest) {
    const eventExists = await prisma.event.findUnique({ where: { slug: eventSlug }, select: { id: true } })
    if (!eventExists) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)
    return apiError('Invalid token', 'INVALID_TOKEN', 401)
  }

  const now = new Date()
  const reminders = await prisma.reminder.findMany({
    where: { eventId: guest.event.id, scheduledAt: { lte: now } },
    orderBy: { scheduledAt: 'desc' },
    select: {
      id: true,
      type: true,
      title: true,
      content: true,
      scheduledAt: true,
      receipts: {
        where: { guestId: guest.id },
        select: { seenAt: true },
      },
    },
  })

  return NextResponse.json({
    reminders: reminders.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      content: r.content,
      scheduledAt: r.scheduledAt.toISOString(),
      seen: r.receipts.length > 0 && r.receipts[0]?.seenAt !== null,
    })),
  })
}

