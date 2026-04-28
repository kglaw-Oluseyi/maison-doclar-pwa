'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { hashPassword } from '@/lib/host-auth'

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const existing = await prisma.hostUser.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!existing || existing.eventId !== event.id) return apiError('Host not found', 'HOST_NOT_FOUND', 404)

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)

  const data: Prisma.HostUserUpdateInput = {}
  if (typeof bodyRaw.name === 'string') data.name = bodyRaw.name.trim()
  if (typeof bodyRaw.email === 'string') data.email = bodyRaw.email.trim()
  if (typeof bodyRaw.role === 'string') data.role = bodyRaw.role.trim()
  if (isRecord(bodyRaw.viewConfig)) data.viewConfig = bodyRaw.viewConfig as Prisma.JsonObject
  if (typeof bodyRaw.password === 'string' && bodyRaw.password.length >= 8) {
    data.passwordHash = await hashPassword(bodyRaw.password)
  }

  await prisma.hostUser.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

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

  const existing = await prisma.hostUser.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!existing || existing.eventId !== event.id) return apiError('Host not found', 'HOST_NOT_FOUND', 404)

  await prisma.hostUser.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

