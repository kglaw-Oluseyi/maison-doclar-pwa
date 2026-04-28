'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '')
    .slice(0, 64)
}

export async function GET(request: NextRequest) {
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      date: true,
      timezone: true,
      status: true,
      _count: { select: { guests: true } },
      guests: { select: { rsvpStatus: true } },
    },
  })

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      slug: e.slug,
      name: e.name,
      status: e.status,
      timezone: e.timezone,
      dateISO: e.date.toISOString(),
      guestCount: e._count.guests,
      acceptedCount: e.guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length,
    })),
  })
}

export async function POST(request: NextRequest) {
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)

  const name = typeof bodyRaw.name === 'string' ? bodyRaw.name.trim() : ''
  const slugRaw = typeof bodyRaw.slug === 'string' ? bodyRaw.slug.trim() : ''
  const dateISO = typeof bodyRaw.dateISO === 'string' ? bodyRaw.dateISO : ''
  const timezone = typeof bodyRaw.timezone === 'string' ? bodyRaw.timezone : 'Europe/London'
  const location = typeof bodyRaw.location === 'string' ? bodyRaw.location.trim() : ''
  const address = typeof bodyRaw.address === 'string' ? bodyRaw.address.trim() : ''
  const coordinates = typeof bodyRaw.coordinates === 'string' ? bodyRaw.coordinates.trim() : ''

  if (!name) return apiError('Event name is required', 'MISSING_NAME', 400)
  const slug = slugify(slugRaw || name)
  if (!slug) return apiError('Event slug is required', 'MISSING_SLUG', 400)
  const date = new Date(dateISO)
  if (Number.isNaN(date.getTime())) return apiError('Invalid date', 'INVALID_DATE', 400)

  const exists = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (exists) return apiError('Slug already in use', 'SLUG_TAKEN', 409)

  const featureFlags =
    isRecord(bodyRaw.featureFlags) ? bodyRaw.featureFlags : {}
  const postEventConfig =
    isRecord(bodyRaw.postEventConfig) ? bodyRaw.postEventConfig : {}
  const designConfig =
    isRecord(bodyRaw.designConfig) ? bodyRaw.designConfig : {}
  const contentConfig =
    isRecord(bodyRaw.contentConfig) ? bodyRaw.contentConfig : {}

  const created = await prisma.event.create({
    data: {
      name,
      slug,
      date,
      endDate: typeof bodyRaw.endDateISO === 'string' ? new Date(bodyRaw.endDateISO) : null,
      timezone,
      location,
      address,
      coordinates: coordinates || null,
      dressCode: typeof bodyRaw.dressCode === 'string' ? bodyRaw.dressCode : null,
      description: typeof bodyRaw.description === 'string' ? bodyRaw.description : null,
      status: 'DRAFT',
      rsvpOpen: true,
      designConfig: designConfig as Prisma.JsonObject,
      contentConfig: contentConfig as Prisma.JsonObject,
      featureFlags: featureFlags as Prisma.JsonObject,
      postEventConfig: postEventConfig as Prisma.JsonObject,
      itinerary: [],
      contacts: [],
      whatsappNumber: null,
    },
    select: { slug: true },
  })

  return NextResponse.json({ ok: true, slug: created.slug })
}

