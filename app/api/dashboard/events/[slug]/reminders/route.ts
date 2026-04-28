'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const REMINDER_TYPES = new Set(['GENERAL', 'SCHEDULE', 'DRESS_CODE', 'TRANSPORT', 'CUSTOM'] as const)
const REMINDER_CHANNELS = new Set(['IN_APP', 'WHATSAPP'] as const)

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

  const reminders = await prisma.reminder.findMany({
    where: { eventId: event.id },
    orderBy: { scheduledAt: 'desc' },
    select: {
      id: true,
      type: true,
      title: true,
      content: true,
      scheduledAt: true,
      sentAt: true,
      channel: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({
    reminders: reminders.map((r) => ({
      ...r,
      scheduledAt: r.scheduledAt.toISOString(),
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  })
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)

  const type = bodyRaw.type
  const title = bodyRaw.title
  const content = bodyRaw.content
  const scheduledAt = bodyRaw.scheduledAt
  const channel = bodyRaw.channel

  if (typeof type !== 'string' || !REMINDER_TYPES.has(type as any)) return apiError('Invalid type', 'INVALID_TYPE', 400)
  if (typeof title !== 'string' || title.trim().length === 0) return apiError('Title is required', 'MISSING_TITLE', 400)
  if (typeof content !== 'string' || content.trim().length === 0) return apiError('Content is required', 'MISSING_CONTENT', 400)
  if (typeof scheduledAt !== 'string') return apiError('scheduledAt is required', 'MISSING_SCHEDULED_AT', 400)
  if (typeof channel !== 'string' || !REMINDER_CHANNELS.has(channel as any)) {
    return apiError('Invalid channel', 'INVALID_CHANNEL', 400)
  }

  const when = new Date(scheduledAt)
  if (Number.isNaN(when.getTime())) return apiError('Invalid scheduledAt', 'INVALID_SCHEDULED_AT', 400)

  const created = await prisma.reminder.create({
    data: {
      eventId: event.id,
      type: type as any,
      title: title.trim(),
      content: content.trim(),
      scheduledAt: when,
      channel: channel as any,
    },
    select: {
      id: true,
      type: true,
      title: true,
      content: true,
      scheduledAt: true,
      sentAt: true,
      channel: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({
    ...created,
    scheduledAt: created.scheduledAt.toISOString(),
    sentAt: created.sentAt ? created.sentAt.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  })
}

