'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return apiError('Missing token', 'MISSING_TOKEN', 400)

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token, event: { slug } },
    select: {
      id: true,
      group: {
        select: { id: true, name: true, maxSize: true, overflowMessage: true },
      },
      event: { select: { featureFlags: true } },
    },
  })
  if (!guest) return apiError('Invalid token', 'INVALID_TOKEN', 401)

  const flags = asRecord(guest.event.featureFlags)
  if (flags.guestGroupsEnabled !== true) return NextResponse.json({ ok: true, group: null })

  return NextResponse.json({ ok: true, group: guest.group })
}

