'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { requireHostEvent } from '@/app/api/host/[slug]/_utils'
import { prisma } from '@/lib/prisma'

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function eventModeFor(now: Date, eventDate: Date, eventEnd: Date): 'pre-event' | 'event-day' | 'post-event' {
  const preEventWindowStart = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000)
  const postEventWindowEnd = new Date(eventEnd.getTime() + 6 * 60 * 60 * 1000)
  if (now < preEventWindowStart) return 'pre-event'
  if (now <= postEventWindowEnd) return 'event-day'
  return 'post-event'
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  const scoped = await requireHostEvent(request, slug)
  if (!scoped.ok) return scoped.response

  const event = await prisma.event.findUnique({
    where: { id: scoped.event.id },
    select: { date: true, endDate: true },
  })
  if (!event) return NextResponse.json({ error: 'Event not found', code: 'EVENT_NOT_FOUND' }, { status: 404 })

  const guests = await prisma.guest.findMany({
    where: { eventId: scoped.event.id },
    select: {
      rsvpStatus: true,
      dietaryNotes: true,
      specialNotes: true,
      rsvpDetails: true,
      checkIn: { select: { id: true } },
    },
  })

  const totalInvited = guests.length
  const totalAccepted = guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length
  const totalDeclined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length
  const totalPending = guests.filter((g) => g.rsvpStatus === 'PENDING').length
  const totalResponded = totalAccepted + totalDeclined
  const totalNotResponded = totalPending
  const arrived = guests.filter((g) => g.checkIn !== null).length
  const notArrived = guests.filter((g) => g.rsvpStatus === 'ACCEPTED' && g.checkIn === null).length

  const totalRequests = await prisma.guestRequest.count({ where: { eventId: scoped.event.id } })
  const pendingRequests = await prisma.guestRequest.count({ where: { eventId: scoped.event.id, status: 'PENDING' } })

  const dietaryCount = guests.filter((g) => {
    if (g.dietaryNotes && g.dietaryNotes.trim().length > 0) return true
    const details = asRecord(g.rsvpDetails)
    const dr = details.dietaryRequirements
    return typeof dr === 'string' && dr.trim().length > 0
  }).length

  const accessibilityCount = guests.filter((g) => g.specialNotes && g.specialNotes.trim().length > 0).length

  const now = new Date()
  const daysUntilEvent = Math.ceil((event.date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  const end = event.endDate ?? event.date
  const eventMode = eventModeFor(now, event.date, end)

  return NextResponse.json({
    totalInvited,
    totalResponded,
    totalNotResponded,
    totalAccepted,
    totalDeclined,
    totalPending,
    arrived,
    notArrived,
    totalRequests,
    pendingRequests,
    dietaryCount,
    accessibilityCount,
    daysUntilEvent,
    eventMode,
  })
}

