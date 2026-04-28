'use server'

import { NextResponse, type NextRequest } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'

type RequestBody = { type?: unknown; message?: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const ALLOWED_TYPES = new Set(['DIETARY', 'TRANSPORT', 'ACCESSIBILITY', 'PLUS_ONE', 'GENERAL'] as const)

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return apiError('Missing token', 'MISSING_TOKEN', 400)

  const bodyRaw: unknown = await request.json().catch(() => null)
  const body: RequestBody | null = isRecord(bodyRaw) ? (bodyRaw as RequestBody) : null
  if (!body) return apiError('Invalid JSON body', 'INVALID_BODY', 400)

  const type = body.type
  const message = body.message
  if (typeof type !== 'string' || !ALLOWED_TYPES.has(type as any)) {
    return apiError('Invalid request type', 'INVALID_TYPE', 400)
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return apiError('Message is required', 'MISSING_MESSAGE', 400)
  }
  if (message.length > 1000) {
    return apiError('Message must be under 1000 characters', 'MESSAGE_TOO_LONG', 400)
  }

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token },
    select: {
      id: true,
      event: { select: { id: true, contentConfig: true } },
    },
  })
  if (!guest) return apiError('Invalid token', 'INVALID_TOKEN', 401)

  const contentConfig = (guest.event.contentConfig ?? {}) as Record<string, unknown>
  const requestFormEnabled = contentConfig.requestFormEnabled === true
  if (!requestFormEnabled) return apiError('Request form is disabled for this event', 'REQUESTS_DISABLED', 409)

  const allowed = contentConfig.requestFormTypes
  if (Array.isArray(allowed) && allowed.length > 0) {
    const allowedSet = new Set(allowed.filter((t) => typeof t === 'string'))
    if (!allowedSet.has(type)) {
      return apiError('Request type is not enabled for this event', 'TYPE_NOT_ENABLED', 400)
    }
  }

  const created = await prisma.guestRequest.create({
    data: {
      guestId: guest.id,
      eventId: guest.event.id,
      type: type as any,
      message: message.trim(),
      status: 'PENDING',
    },
    select: {
      id: true,
      type: true,
      message: true,
      status: true,
      operatorNote: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({
    ...created,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  })
}

