import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'

type RSVPBody = {
  status?: 'ACCEPTED' | 'DECLINED'
  details?: {
    plusOneName?: string
    dietaryRequirements?: string
    message?: string
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return apiError('Missing token', 'MISSING_TOKEN', 400)

  let body: RSVPBody | null = null
  try {
    const parsed: unknown = await request.json()
    body = isRecord(parsed) ? (parsed as RSVPBody) : null
  } catch {
    body = null
  }
  if (!body) return apiError('Invalid JSON body', 'INVALID_BODY', 400)

  const status = body.status
  if (status !== 'ACCEPTED' && status !== 'DECLINED') {
    return apiError('Invalid RSVP status', 'INVALID_STATUS', 400)
  }

  // Validate token scope first (do not reveal event state before auth).
  const guest = await prisma.guest.findFirst({
    where: { accessToken: token, event: { slug } },
    select: {
      id: true,
      event: { select: { id: true, rsvpOpen: true } },
    },
  })

  if (!guest) {
    const eventExists = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
    if (!eventExists) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)
    return apiError('Invalid token', 'INVALID_TOKEN', 401)
  }

  if (!guest.event.rsvpOpen) {
    return apiError('RSVP is closed for this event', 'RSVP_CLOSED', 409)
  }

  const detailsRecord: Prisma.JsonObject = {}
  if (body.details && isRecord(body.details)) {
    const plusOneName = asOptionalString(body.details.plusOneName)
    const dietaryRequirements = asOptionalString(body.details.dietaryRequirements)
    const message = asOptionalString(body.details.message)
    if (plusOneName) detailsRecord.plusOneName = plusOneName
    if (dietaryRequirements) detailsRecord.dietaryRequirements = dietaryRequirements
    if (message) detailsRecord.message = message
  }

  const updated = await prisma.guest.update({
    where: { id: guest.id },
    data: {
      rsvpStatus: status,
      rsvpDetails: detailsRecord,
    },
    select: {
      id: true,
      name: true,
      rsvpStatus: true,
      rsvpDetails: true,
      tableNumber: true,
      dietaryNotes: true,
      tags: true,
    },
  })

  return NextResponse.json({
    guest: {
      id: updated.id,
      name: updated.name,
      rsvpStatus: updated.rsvpStatus,
      rsvpDetails: isRecord(updated.rsvpDetails) ? updated.rsvpDetails : {},
      tableNumber: updated.tableNumber,
      dietaryNotes: updated.dietaryNotes,
      tags: updated.tags,
    },
  })
}

