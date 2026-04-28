'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { generateHostSessionToken, verifyPassword } from '@/lib/host-auth'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isRecord(bodyRaw)) return apiError('Invalid payload', 'INVALID_PAYLOAD', 400)
  const email = bodyRaw.email
  const password = bodyRaw.password
  if (typeof email !== 'string' || email.trim().length === 0) return apiError('Email is required', 'MISSING_EMAIL', 400)
  if (typeof password !== 'string' || password.length === 0) return apiError('Password is required', 'MISSING_PASSWORD', 400)

  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
  if (!event) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)

  const host = await prisma.hostUser.findFirst({
    where: { email: email.trim().toLowerCase(), eventId: event.id },
    select: { id: true, passwordHash: true },
  })
  if (!host) return apiError('Invalid credentials', 'INVALID_CREDENTIALS', 401)

  const ok = await verifyPassword(password, host.passwordHash)
  if (!ok) return apiError('Invalid credentials', 'INVALID_CREDENTIALS', 401)

  const token = await generateHostSessionToken(event.id)
  const response = NextResponse.json({ ok: true })
  response.cookies.set('md-host-session', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return response
}

