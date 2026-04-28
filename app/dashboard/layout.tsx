import { cookies } from 'next/headers'

import { ThemeProvider, type Theme } from '@/components/dashboard/ThemeProvider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('md-theme')?.value
  const initialTheme: Theme = themeCookie === 'light' ? 'light' : 'dark'

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <div className="min-h-[100svh] bg-md-background text-md-text-primary">{children}</div>
    </ThemeProvider>
  )
}

