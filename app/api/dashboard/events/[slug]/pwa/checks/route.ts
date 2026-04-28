'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import path from 'node:path'
import fs from 'node:fs/promises'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

async function fetchOk(url: string): Promise<{ ok: boolean; detail: string }> {
  const res = await fetch(url, { cache: 'no-store' }).catch(() => null)
  if (!res) return { ok: false, detail: 'Network error' }
  return res.ok ? { ok: true, detail: `${res.status}` } : { ok: false, detail: `${res.status}` }
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, name: true, date: true, contentConfig: true },
  })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const origin = request.nextUrl.origin
  const manifestUrl = `${origin}/events/${slug}/manifest.webmanifest`
  const swUrl = `${origin}/events/${slug}/sw.js`
  const offlineUrl = `${origin}/events/${slug}/offline`

  const enabledCards =
    event.contentConfig && typeof event.contentConfig === 'object' && !Array.isArray(event.contentConfig)
      ? ((event.contentConfig as any).enabledCards as unknown)
      : null

  const hasEnabledCards = Array.isArray(enabledCards) ? enabledCards.length > 0 : true

  const iconPath = path.join(process.cwd(), 'public', 'events', slug, 'icons', '512.png')
  const iconExists = await fs
    .stat(iconPath)
    .then((s) => s.isFile())
    .catch(() => false)

  const guestCount = await prisma.guest.count({ where: { eventId: event.id } })

  const results: Record<string, { ok: boolean; detail: string }> = {}
  results['name-date'] = { ok: Boolean(event.name) && !!event.date, detail: event.name ? 'OK' : 'Missing name' }
  results['guest-count'] = { ok: guestCount > 0, detail: `${guestCount} guests` }
  results['logo'] = { ok: iconExists, detail: iconExists ? 'Icon present' : 'Upload an icon' }
  results['cards'] = { ok: hasEnabledCards, detail: hasEnabledCards ? 'OK' : 'Enable at least one card' }

  const [m, s, o] = await Promise.all([fetchOk(manifestUrl), fetchOk(swUrl), fetchOk(offlineUrl)])
  results['manifest'] = m
  results['sw'] = s
  results['offline'] = o

  return NextResponse.json({ results })
}

