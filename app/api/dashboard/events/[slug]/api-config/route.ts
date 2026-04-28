'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const [cfg, keys] = await Promise.all([
    prisma.apiConfig.findUnique({ where: { eventId: event.id } }),
    prisma.apiKey.findMany({
      where: { eventId: event.id, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, label: true, createdAt: true, lastUsedAt: true },
    }),
  ])

  return NextResponse.json({
    integrationMode: cfg?.integrationMode ?? 'STANDALONE',
    osBaseUrl: cfg?.osBaseUrl ?? '',
    osWebhookUrl: cfg?.osWebhookUrl ?? '',
    webhookSubscriptions: cfg?.webhookSubscriptions ?? {},
    keys: keys.map((k) => ({
      id: k.id,
      label: k.label,
      createdAtISO: k.createdAt.toISOString(),
      lastUsedAtISO: k.lastUsedAt?.toISOString() ?? null,
    })),
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

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, contentConfig: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)

  const integrationMode = typeof bodyRaw.integrationMode === 'string' ? bodyRaw.integrationMode : null
  if (!integrationMode || !['STANDALONE', 'INTEGRATED', 'HYBRID'].includes(integrationMode)) {
    return apiError('Invalid integration mode', 'INVALID_MODE', 400)
  }
  const osBaseUrl = typeof bodyRaw.osBaseUrl === 'string' ? bodyRaw.osBaseUrl.trim() : ''
  const osWebhookUrl = typeof bodyRaw.osWebhookUrl === 'string' ? bodyRaw.osWebhookUrl.trim() : ''
  const webhookSubscriptions = isRecord(bodyRaw.webhookSubscriptions) ? bodyRaw.webhookSubscriptions : {}

  await prisma.apiConfig.upsert({
    where: { eventId: event.id },
    update: {
      integrationMode,
      osBaseUrl: osBaseUrl || null,
      osWebhookUrl: osWebhookUrl || null,
      webhookSubscriptions: webhookSubscriptions as Prisma.JsonObject,
    },
    create: {
      eventId: event.id,
      integrationMode,
      osBaseUrl: osBaseUrl || null,
      osWebhookUrl: osWebhookUrl || null,
      webhookSubscriptions: webhookSubscriptions as Prisma.JsonObject,
    },
  })

  // Mirror mode into contentConfig for operator visibility.
  const contentConfig =
    event.contentConfig && typeof event.contentConfig === 'object' && !Array.isArray(event.contentConfig)
      ? (event.contentConfig as Record<string, unknown>)
      : {}
  await prisma.event.update({
    where: { id: event.id },
    data: { contentConfig: { ...contentConfig, integrationMode } as Prisma.JsonObject },
  })

  return NextResponse.json({ ok: true })
}

