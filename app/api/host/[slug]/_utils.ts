import type { NextRequest } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { verifyHostSessionToken } from '@/lib/host-auth'

export async function requireHostEvent(request: NextRequest, slug: string) {
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true, slug: true } })
  if (!event) return { ok: false as const, response: apiError('Event not found', 'EVENT_NOT_FOUND', 404) }

  const session = request.cookies.get('md-host-session')?.value
  if (!session) return { ok: false as const, response: apiError('Unauthorized', 'UNAUTHORIZED', 401) }

  const ok = await verifyHostSessionToken(session, event.id)
  if (!ok) return { ok: false as const, response: apiError('Unauthorized', 'UNAUTHORIZED', 401) }

  return { ok: true as const, event }
}

