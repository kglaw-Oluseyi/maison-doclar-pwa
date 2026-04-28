import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

import { prisma } from '@/lib/prisma'

function parseSize(input: string): { size: number; maskable: boolean } | null {
  const maskable = input.endsWith('-maskable')
  const raw = maskable ? input.slice(0, -'-maskable'.length) : input
  const size = Number(raw)
  if (!Number.isFinite(size)) return null
  if (size !== 192 && size !== 512) return null
  return { size, maskable }
}

function pickLetter(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'M'
  const first = trimmed[0]
  return first ? first.toUpperCase() : 'M'
}

function svgPlaceholder(letter: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#000000"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
        font-family="Cormorant Garamond, Georgia, serif"
        font-weight="300"
        font-size="520"
        fill="#B79F85">${letter}</text>
</svg>`
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string; size: string } }) {
  const parsed = parseSize(params.size)
  if (!parsed) return new NextResponse('Not found', { status: 404 })

  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  })

  const letter = pickLetter(event?.name ?? 'Maison Doclar')
  const svg = svgPlaceholder(letter)

  let pipeline = sharp(Buffer.from(svg)).resize(parsed.size, parsed.size).png()

  if (parsed.maskable) {
    pipeline = sharp(Buffer.from(svg))
      .resize(parsed.size, parsed.size)
      .extend({
        top: Math.floor(parsed.size * 0.1),
        bottom: Math.floor(parsed.size * 0.1),
        left: Math.floor(parsed.size * 0.1),
        right: Math.floor(parsed.size * 0.1),
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .resize(parsed.size, parsed.size)
      .png()
  }

  const png = await pipeline.toBuffer()

  return new NextResponse(png as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

