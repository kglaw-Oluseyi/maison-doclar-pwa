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

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      timezone: true,
      date: true,
      endDate: true,
      location: true,
      address: true,
      coordinates: true,
      dressCode: true,
      description: true,
      rsvpOpen: true,
      whatsappNumber: true,
      whatsappTemplate: true,
    },
  })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  return NextResponse.json({
    ...event,
    dateISO: event.date.toISOString(),
    endDateISO: event.endDate?.toISOString() ?? null,
  })
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)

  const data: Prisma.EventUpdateInput = {}
  if (typeof bodyRaw.name === 'string') data.name = bodyRaw.name.trim()
  if (typeof bodyRaw.status === 'string') data.status = bodyRaw.status as any
  if (typeof bodyRaw.timezone === 'string') data.timezone = bodyRaw.timezone
  if (typeof bodyRaw.dateISO === 'string') data.date = new Date(bodyRaw.dateISO)
  if (bodyRaw.endDateISO === null) data.endDate = null
  if (typeof bodyRaw.endDateISO === 'string') data.endDate = new Date(bodyRaw.endDateISO)
  if (typeof bodyRaw.location === 'string') data.location = bodyRaw.location.trim()
  if (typeof bodyRaw.address === 'string') data.address = bodyRaw.address.trim()
  if (bodyRaw.coordinates === null) data.coordinates = null
  if (typeof bodyRaw.coordinates === 'string') data.coordinates = bodyRaw.coordinates.trim() || null
  if (bodyRaw.dressCode === null) data.dressCode = null
  if (typeof bodyRaw.dressCode === 'string') data.dressCode = bodyRaw.dressCode.trim() || null
  if (bodyRaw.description === null) data.description = null
  if (typeof bodyRaw.description === 'string') data.description = bodyRaw.description.trim() || null
  if (typeof bodyRaw.rsvpOpen === 'boolean') data.rsvpOpen = bodyRaw.rsvpOpen

  if (bodyRaw.whatsappNumber === null) {
    data.whatsappNumber = null
  } else if (typeof bodyRaw.whatsappNumber === 'string') {
    const w = bodyRaw.whatsappNumber.trim()
    if (w.length === 0) data.whatsappNumber = null
    else {
      if (!/^\d{7,15}$/.test(w)) {
        return apiError('WhatsApp number must be 7-15 digits including country code.', 'INVALID_WHATSAPP_NUMBER', 400)
      }
      data.whatsappNumber = w
    }
  }

  if (bodyRaw.whatsappTemplate === null) {
    data.whatsappTemplate = null
  } else if (typeof bodyRaw.whatsappTemplate === 'string') {
    const t = bodyRaw.whatsappTemplate.trim()
    data.whatsappTemplate = t.length ? t : null
  }

  const updated = await prisma.event.update({
    where: { slug },
    data,
    select: { slug: true },
  }).catch(() => null)

  if (!updated) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)
  return NextResponse.json({ ok: true })
}

