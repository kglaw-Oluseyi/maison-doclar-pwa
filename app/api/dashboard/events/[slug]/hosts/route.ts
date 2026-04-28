'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { hashPassword } from '@/lib/host-auth'

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

  const users = await prisma.hostUser.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true, viewConfig: true, createdAt: true, updatedAt: true },
  })
  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      createdAtISO: u.createdAt.toISOString(),
      updatedAtISO: u.updatedAt.toISOString(),
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
  const name = typeof bodyRaw.name === 'string' ? bodyRaw.name.trim() : ''
  const email = typeof bodyRaw.email === 'string' ? bodyRaw.email.trim() : ''
  const role = typeof bodyRaw.role === 'string' ? bodyRaw.role.trim() : 'Host'
  const password = typeof bodyRaw.password === 'string' ? bodyRaw.password : ''
  if (!name) return apiError('Name is required', 'MISSING_NAME', 400)
  if (!email) return apiError('Email is required', 'MISSING_EMAIL', 400)
  if (!password || password.length < 8) return apiError('Password must be at least 8 characters', 'WEAK_PASSWORD', 400)

  const passwordHash = await hashPassword(password)
  const created = await prisma.hostUser.create({
    data: { eventId: event.id, name, email, role, passwordHash, viewConfig: {} },
    select: { id: true },
  })
  return NextResponse.json({ ok: true, id: created.id })
}

