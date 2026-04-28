'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import path from 'node:path'
import fs from 'node:fs/promises'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'
import { generateEventIcons } from '@/lib/icons'

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const form = await request.formData().catch(() => null)
  if (!form) return apiError('Invalid form', 'INVALID_FORM', 400)
  const file = form.get('file')
  if (!(file instanceof File)) return apiError('Missing file', 'MISSING_FILE', 400)
  if (file.type !== 'image/png') return apiError('Icon must be a PNG', 'INVALID_TYPE', 400)

  const buf = Buffer.from(new Uint8Array(await file.arrayBuffer()))
  const icons = await generateEventIcons(buf, slug)

  const dir = path.join(process.cwd(), 'public', 'events', slug, 'icons')
  await fs.mkdir(dir, { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(dir, '192.png'), icons.icon192),
    fs.writeFile(path.join(dir, '512.png'), icons.icon512),
    fs.writeFile(path.join(dir, '512-maskable.png'), icons.icon512Maskable),
    fs.writeFile(path.join(dir, 'apple-touch-icon.png'), icons.appleTouchIcon),
  ])

  return NextResponse.json({ ok: true })
}

