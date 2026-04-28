'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { requireHostEvent } from '@/app/api/host/[slug]/_utils'
import { prisma } from '@/lib/prisma'

const DEFAULT_VIEW_CONFIG = {
  showStatsBar: true,
  showArrivalFeed: true,
  showGuestList: true,
  showDietaryAccessibilitySummary: true,
  showOutstandingRequests: true,
  showAwaitingResponseList: true,
  showExportButton: true,
  showRsvpDetails: true,
  showVipAlerts: true,
  showPostEventSummary: true,
  eventDayModeAutoSwitch: true,
} as const

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  const scoped = await requireHostEvent(request, slug)
  if (!scoped.ok) return scoped.response

  const host = await prisma.hostUser.findFirst({
    where: { eventId: scoped.event.id },
    orderBy: { createdAt: 'asc' },
    select: { role: true, viewConfig: true },
  })

  const viewConfigRaw = asRecord(host?.viewConfig)
  return NextResponse.json({
    role: host?.role ?? 'HOST',
    viewConfig: {
      ...DEFAULT_VIEW_CONFIG,
      ...viewConfigRaw,
    },
  })
}

