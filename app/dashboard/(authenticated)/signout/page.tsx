import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardSignOutPage() {
  const cookieStore = await cookies()
  cookieStore.set('md-dashboard-session', '', { path: '/', maxAge: 0 })
  redirect('/dashboard/login')
}

