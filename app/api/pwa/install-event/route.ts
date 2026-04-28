import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)
    }

    const record = body as Record<string, unknown>
    const eventId = record.eventId
    const guestId = record.guestId
    const eventType = record.eventType
    const userAgent = record.userAgent

    const validTypes = ['prompt_shown', 'install_accepted', 'install_dismissed', 'offline_fallback_served'] as const

    if (typeof eventId !== 'string' || typeof eventType !== 'string' || !validTypes.includes(eventType as never)) {
      return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)
    }

    await prisma.pwaInstallEvent.create({
      data: {
        eventId,
        guestId: typeof guestId === 'string' ? guestId : null,
        eventType,
        userAgent: typeof userAgent === 'string' ? userAgent : request.headers.get('user-agent'),
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return apiError('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

