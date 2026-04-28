import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { pwaConfig: true },
  })

  if (!event) {
    return new NextResponse('Not found', { status: 404 })
  }

  const config = event.designConfig as Record<string, unknown>
  const palette = (config.palette ?? {}) as Record<string, string>

  const manifest = {
    name: event.name,
    short_name: event.name.split(' ').slice(0, 2).join(' '),
    description: event.description ?? `Your guide to ${event.name}`,
    start_url: `/events/${event.slug}`,
    scope: `/events/${event.slug}`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: palette.background ?? '#000000',
    theme_color: palette.accent ?? '#B79F85',
    lang: 'en',
    icons: [
      {
        src: `/events/${event.slug}/icons/192`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/events/${event.slug}/icons/512`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `/events/${event.slug}/icons/512-maskable`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [],
    categories: ['lifestyle', 'entertainment'],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

