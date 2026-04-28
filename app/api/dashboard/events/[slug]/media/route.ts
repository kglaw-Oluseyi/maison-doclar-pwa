'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import path from 'node:path'
import fs from 'node:fs/promises'

import { apiError } from '@/lib/api'
import { requireDashboardSession, DashboardAuthError } from '@/lib/dashboard-auth'

function safeName(name: string): string {
  return name.replaceAll(/[^a-zA-Z0-9._-]/g, '-')
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const dir = path.join(process.cwd(), 'public', 'events', slug, 'media')
  await fs.mkdir(dir, { recursive: true })
  const names = await fs.readdir(dir).catch(() => [])
  const items = await Promise.all(
    names.map(async (name) => {
      const full = path.join(dir, name)
      const stat = await fs.stat(full).catch(() => null)
      if (!stat || !stat.isFile()) return null
      const url = `/events/${slug}/media/${encodeURIComponent(name)}`
      const type = name.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : name.toLowerCase().endsWith('.mp4') || name.toLowerCase().endsWith('.mov')
          ? 'video/mp4'
          : 'image/*'
      return { name, url, type, size: stat.size }
    }),
  )

  return NextResponse.json({ items: items.filter(Boolean) })
}

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

  const name = safeName(file.name || 'upload')
  const size = file.size
  const type = file.type

  const isVideo = type === 'video/mp4' || type === 'video/quicktime'
  const isPdf = type === 'application/pdf'
  const isImage = type.startsWith('image/')
  if (!isVideo && !isPdf && !isImage) return apiError('Unsupported file type', 'UNSUPPORTED', 400)
  if (isVideo && size > 50 * 1024 * 1024) return apiError('Video must be under 50MB', 'TOO_LARGE', 400)
  if (isPdf && size > 10 * 1024 * 1024) return apiError('PDF must be under 10MB', 'TOO_LARGE', 400)

  const bytes = new Uint8Array(await file.arrayBuffer())
  const dir = path.join(process.cwd(), 'public', 'events', slug, 'media')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, name), bytes)

  return NextResponse.json({ ok: true })
}

