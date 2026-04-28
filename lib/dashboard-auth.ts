import type { NextRequest } from 'next/server'

import { verifyDashboardSessionToken } from './auth'

export class DashboardAuthError extends Error {
  public readonly code: 'UNAUTHENTICATED' | 'MISCONFIGURED'

  public constructor(code: DashboardAuthError['code'], message: string) {
    super(message)
    this.code = code
  }
}

export async function requireDashboardSession(request: NextRequest): Promise<void> {
  if (!process.env.DASHBOARD_PASSWORD || !process.env.SESSION_SECRET) {
    throw new DashboardAuthError('MISCONFIGURED', 'Dashboard authentication is not configured')
  }

  const session = request.cookies.get('md-dashboard-session')?.value
  const ok = await verifyDashboardSessionToken(session)
  if (!ok) {
    throw new DashboardAuthError('UNAUTHENTICATED', 'Invalid dashboard session')
  }
}

