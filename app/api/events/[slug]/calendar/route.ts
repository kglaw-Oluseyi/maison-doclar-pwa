import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { apiError } from '@/lib/api'
import { generateICS } from '@/lib/ics'
import { prisma } from '@/lib/prisma'

function sanitizeFilenameComponent(value: string): string {
  // Keep safe filename characters for Windows/iOS.
  const cleaned = value.replaceAll(/[^a-zA-Z0-9._-]/g, '-').replaceAll(/-+/g, '-')
  return cleaned.length === 0 ? 'event' : cleaned
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return apiError('Missing token', 'MISSING_TOKEN', 400)

  const guest = await prisma.guest.findFirst({
    where: { accessToken: token, event: { slug } },
    select: {
      id: true,
      event: {
        select: {
          id: true,
          slug: true,
          name: true,
          date: true,
          endDate: true,
          address: true,
          description: true,
        },
      },
    },
  })

  if (!guest) {
    const eventExists = await prisma.event.findUnique({ where: { slug }, select: { id: true } })
    if (!eventExists) return apiError('Event not found', 'EVENT_NOT_FOUND', 404)
    return apiError('Invalid token', 'INVALID_TOKEN', 401)
  }

  const ics = generateICS({
    id: guest.event.id,
    name: guest.event.name,
    date: guest.event.date,
    endDate: guest.event.endDate,
    address: guest.event.address,
    description: guest.event.description,
    slug: guest.event.slug,
  })

  const safeSlug = sanitizeFilenameComponent(slug)
  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeSlug}.ics"`,
      'Cache-Control': 'no-store',
    },
  })
}

