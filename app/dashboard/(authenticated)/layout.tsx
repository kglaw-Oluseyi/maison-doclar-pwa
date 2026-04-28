import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { verifyDashboardSessionToken } from '@/lib/auth'
import { ThemeProvider, type Theme } from '@/components/dashboard/ThemeProvider'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function AuthenticatedDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('md-dashboard-session')

  if (!session?.value) {
    redirect('/dashboard/login')
  }

  const ok = await verifyDashboardSessionToken(session.value)
  if (!ok) {
    redirect('/dashboard/login')
  }

  const themeCookie = cookieStore.get('md-theme')?.value
  const initialTheme: Theme = themeCookie === 'light' ? 'light' : 'dark'

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <DashboardShell>{children}</DashboardShell>
    </ThemeProvider>
  )
}

