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

  const event = await prisma.event.findUnique({ where: { slug }, select: { featureFlags: true, postEventConfig: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)
  return NextResponse.json({ featureFlags: event.featureFlags, postEventConfig: event.postEventConfig })
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

  const featureFlags = isRecord(bodyRaw.featureFlags) ? bodyRaw.featureFlags : null
  const postEventConfig = isRecord(bodyRaw.postEventConfig) ? bodyRaw.postEventConfig : null
  if (!featureFlags) return apiError('Invalid featureFlags', 'INVALID_FLAGS', 400)

  await prisma.event.update({
    where: { slug },
    data: {
      featureFlags: featureFlags as Prisma.JsonObject,
      postEventConfig: postEventConfig ? (postEventConfig as Prisma.JsonObject) : undefined,
    },
    select: { id: true },
  }).catch(() => null)

  return NextResponse.json({ ok: true })
}

