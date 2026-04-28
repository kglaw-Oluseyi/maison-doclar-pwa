'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

const ORDER = ['DRAFT', 'PUBLISHED', 'LIVE', 'CONCLUDED', 'ARCHIVED'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function canTransition(from: string, to: string): boolean {
  const a = ORDER.indexOf(from as any)
  const b = ORDER.indexOf(to as any)
  return a >= 0 && b >= 0 && b > a
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
  const nextStatus = bodyRaw.status
  if (typeof nextStatus !== 'string' || !ORDER.includes(nextStatus as any)) {
    return apiError('Invalid status', 'INVALID_STATUS', 400)
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, status: true, postEventConfig: true },
  })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)
  if (!canTransition(event.status, nextStatus)) {
    return apiError('Invalid transition', 'INVALID_TRANSITION', 409)
  }

  let postEventConfig = event.postEventConfig as Record<string, unknown>
  if (!postEventConfig || typeof postEventConfig !== 'object' || Array.isArray(postEventConfig)) postEventConfig = {}
  if (nextStatus === 'CONCLUDED' && typeof postEventConfig.activatesAt !== 'string') {
    postEventConfig = { ...postEventConfig, activatesAt: new Date().toISOString() }
  }

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: { status: nextStatus as any, postEventConfig: postEventConfig as Prisma.JsonObject },
    select: { id: true, slug: true, status: true, postEventConfig: true },
  })

  return NextResponse.json(updated)
}

