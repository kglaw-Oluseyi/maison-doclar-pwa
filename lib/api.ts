import { NextResponse } from 'next/server'

export type ApiError = { error: string; code: string }

export function apiError(error: string, code: string, status: number): NextResponse {
  return NextResponse.json({ error, code } satisfies ApiError, { status })
}

