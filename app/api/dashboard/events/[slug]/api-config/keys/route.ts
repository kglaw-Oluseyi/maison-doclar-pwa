'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { generateRawApiKey, hmacKeyHash } from '@/lib/api-keys'

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const secret = process.env.SESSION_SECRET
  if (!secret) return apiError('Server misconfigured', 'MISCONFIGURED', 500)

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)

  const label = typeof bodyRaw.label === 'string' ? bodyRaw.label.trim() : ''
  const permissionsRaw = bodyRaw.permissions
  if (!label) return apiError('Label is required', 'MISSING_LABEL', 400)
  const permissions = Array.isArray(permissionsRaw)
    ? permissionsRaw.filter((p) => typeof p === 'string')
    : []

  const rawKey = generateRawApiKey()
  const keyHash = hmacKeyHash(rawKey, secret)

  const created = await prisma.apiKey.create({
    data: {
      eventId: event.id,
      label,
      keyHash,
      permissions: { permissions } as Prisma.JsonObject,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: created.id, rawKey })
}

