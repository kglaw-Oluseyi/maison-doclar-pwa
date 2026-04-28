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

export async function DELETE(request: NextRequest, context: { params: Promise<{ slug: string; filename: string }> }) {
  const { slug, filename } = await context.params
  try {
    await requireDashboardSession(request)
  } catch (err: unknown) {
    if (err instanceof DashboardAuthError) return apiError('Unauthorized', err.code, 401)
    return apiError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const dir = path.join(process.cwd(), 'public', 'events', slug, 'media')
  const full = path.join(dir, safeName(filename))
  await fs.unlink(full).catch(() => null)
  return NextResponse.json({ ok: true })
}

