'use server'

import { type NextRequest } from 'next/server'

import { apiError } from '@/lib/api'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return apiError('Missing token', 'MISSING_TOKEN', 400)

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token },
    select: { id: true, eventId: true },
  })
  if (!guest) return apiError('Invalid token', 'INVALID_TOKEN', 401)

  const reminder = await prisma.reminder.findUnique({ where: { id }, select: { id: true, eventId: true } })
  if (!reminder) return apiError('Reminder not found', 'REMINDER_NOT_FOUND', 404)
  if (reminder.eventId !== guest.eventId) return apiError('Forbidden', 'FORBIDDEN', 403)

  const now = new Date()
  await prisma.reminderReceipt.upsert({
    where: {
      reminderId_guestId: {
        reminderId: reminder.id,
        guestId: guest.id,
      },
    },
    update: { seenAt: now },
    create: { reminderId: reminder.id, guestId: guest.id, seenAt: now },
  })

  return new Response(null, { status: 204 })
}

