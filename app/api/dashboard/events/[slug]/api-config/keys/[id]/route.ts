'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

export async function DELETE(request: NextRequest, context: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const key = await prisma.apiKey.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!key || key.eventId !== event.id) return apiError('Key not found', 'KEY_NOT_FOUND', 404)

  await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } })
  return NextResponse.json({ ok: true })
}

