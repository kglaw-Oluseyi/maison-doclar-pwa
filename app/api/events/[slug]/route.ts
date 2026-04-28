import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'

type ItineraryBlock = {
  time: string
  title: string
  detail?: string
}

type Contact = {
  role: string
  name: string
  phone: string
  email?: string
}

type DesignConfig = Record<string, unknown>

function parseJsonArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback
}

function parseJsonObject(value: unknown, fallback: Record<string, unknown>): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return fallback
  return value as Record<string, unknown>
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return apiError('Missing token', 'MISSING_TOKEN', 400)

  // Single scoped lookup: token + event slug join. Explicit selects only.
  const guest = await prisma.guest.findFirst({
    where: {
      accessToken: token,
      event: { slug },
    },
    select: {
      id: true,
      name: true,
      rsvpStatus: true,
      rsvpDetails: true,
      tableNumber: true,
      dietaryNotes: true,
      tags: true,
      event: {
        select: {
          id: true,
          name: true,
          date: true,
          endDate: true,
          location: true,
          address: true,
          coordinates: true,
          dressCode: true,
          description: true,
          rsvpOpen: true,
          itinerary: true,
          contacts: true,
          whatsappNumber: true,
          designConfig: true,
        },
      },
    },
  })

  if (!guest) {
    // Distinguish 404 event from 401 token without leaking cross-event info:
    const eventExists = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!eventExists) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)
    return apiError('Invalid token', 'INVALID_TOKEN', 401)
  }

  const itinerary = parseJsonArray<ItineraryBlock>(guest.event.itinerary, [])
  const contacts = parseJsonArray<Contact>(guest.event.contacts, [])
  const designConfig = parseJsonObject(guest.event.designConfig, {}) as DesignConfig

  return NextResponse.json({
    event: {
      id: guest.event.id,
      name: guest.event.name,
      date: guest.event.date.toISOString(),
      endDate: guest.event.endDate ? guest.event.endDate.toISOString() : null,
      location: guest.event.location,
      address: guest.event.address,
      coordinates: guest.event.coordinates,
      dressCode: guest.event.dressCode,
      description: guest.event.description,
      rsvpOpen: guest.event.rsvpOpen,
      itinerary,
      contacts,
      whatsappNumber: guest.event.whatsappNumber,
      designConfig,
    },
    guest: {
      id: guest.id,
      name: guest.name,
      rsvpStatus: guest.rsvpStatus,
      rsvpDetails: parseJsonObject(guest.rsvpDetails, {}),
      tableNumber: guest.tableNumber,
      dietaryNotes: guest.dietaryNotes,
      tags: guest.tags,
    },
  })
}

