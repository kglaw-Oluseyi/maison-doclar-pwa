import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { generateDashboardSessionToken, verifyDashboardSessionToken } from '@/lib/auth'

function isPreviewBypassAllowed(request: NextRequest): boolean {
  if (process.env.VERCEL_ENV !== 'preview') return false
  const bypassToken = process.env.PREVIEW_BYPASS_TOKEN
  if (!bypassToken) return false
  const provided = request.headers.get('x-md-preview-bypass')
  return provided === bypassToken
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/dashboard')) return NextResponse.next()
  if (pathname === '/dashboard/login') return NextResponse.next()

  // Safe bypass for Vercel preview only (never production).
  if (isPreviewBypassAllowed(request)) {
    const result = await generateDashboardSessionToken()
    if (result.ok) {
      const response = NextResponse.next()
      response.cookies.set('md-dashboard-session', result.token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 2,
      })
      return response
    }
  }

  const session = request.cookies.get('md-dashboard-session')?.value
  const ok = await verifyDashboardSessionToken(session)
  if (!ok) {
    return NextResponse.redirect(new URL('/dashboard/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

