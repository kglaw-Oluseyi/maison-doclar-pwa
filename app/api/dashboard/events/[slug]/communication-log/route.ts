'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const pageParam = request.nextUrl.searchParams.get('page')
  const page = Math.max(1, Number(pageParam ?? '1') || 1)
  const pageSize = 50
  const skip = (page - 1) * pageSize

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, featureFlags: true },
  })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const flags =
    event.featureFlags && typeof event.featureFlags === 'object' && !Array.isArray(event.featureFlags)
      ? (event.featureFlags as Record<string, unknown>)
      : {}
  if (flags.communicationLogEnabled !== true) return apiError('Communication log disabled', 'FEATURE_DISABLED', 409)

  const [items, total] = await Promise.all([
    prisma.communicationLog.findMany({
      where: { eventId: event.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        type: true,
        summary: true,
        channel: true,
        createdAt: true,
        guest: { select: { name: true } },
      },
    }),
    prisma.communicationLog.count({ where: { eventId: event.id } }),
  ])

  return NextResponse.json({
    page,
    pageSize,
    total,
    items: items.map((i) => ({
      id: i.id,
      guestName: i.guest.name,
      type: i.type,
      summary: i.summary,
      channel: i.channel,
      createdAtISO: i.createdAt.toISOString(),
    })),
  })
}

