import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import path from 'node:path'
import fs from 'node:fs/promises'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'public', 'events', params.slug, 'icons', 'apple-touch-icon.png')
  const buf = await fs.readFile(filePath).catch(() => null)
  if (!buf) return new NextResponse('Not found', { status: 404 })
  return new NextResponse(buf as unknown as BodyInit, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  })
}

