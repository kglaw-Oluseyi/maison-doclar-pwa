'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { logCommunication } from '@/lib/communication-log'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return apiError('Missing token', 'MISSING_TOKEN', 400)

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token, event: { slug } },
    select: { id: true, event: { select: { id: true, postEventConfig: true, featureFlags: true } } },
  })
  if (!guest) return apiError('Invalid token', 'INVALID_TOKEN', 401)

  const cfg = guest.event.postEventConfig as Record<string, unknown>
  const flags = guest.event.featureFlags as Record<string, unknown>
  const feedbackEnabled = cfg?.feedbackEnabled === true && flags?.feedbackFormEnabled !== false
  if (!feedbackEnabled) return apiError('Feedback is disabled', 'FEEDBACK_DISABLED', 409)

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)
  const responses = bodyRaw.responses
  if (!Array.isArray(responses)) return apiError('Invalid responses', 'INVALID_RESPONSES', 400)

  await prisma.feedbackResponse.upsert({
    where: { guestId_eventId: { guestId: guest.id, eventId: guest.event.id } },
    update: { responses },
    create: { guestId: guest.id, eventId: guest.event.id, responses },
  })

  try {
    void logCommunication({
      guestId: guest.id,
      eventId: guest.event.id,
      type: 'RSVP_SUBMITTED',
      channel: 'IN_APP',
      summary: 'Feedback submitted',
      metadata: {},
    })
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true })
}

