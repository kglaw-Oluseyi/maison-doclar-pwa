import { cookies } from 'next/headers'

import { ThemeProvider, type Theme } from '@/components/dashboard/ThemeProvider'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('md-theme')?.value
  const initialTheme: Theme = themeCookie === 'light' ? 'light' : 'dark'

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <DashboardShell>{children}</DashboardShell>
    </ThemeProvider>
  )
}

