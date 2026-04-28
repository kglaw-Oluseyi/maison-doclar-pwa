import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default async function DashboardIndexPage() {
  const first = await prisma.event.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { slug: true, name: true },
  })

  if (!first) {
    return (
      <div>
        <DashboardHeader />
        <main className="mx-auto max-w-[1100px] px-6 py-10">
          <div className="flex min-h-[60svh] items-center justify-center">
            <Card title="Dashboard" className="w-full max-w-xl text-center">
              <div className="mx-auto flex flex-col items-center gap-4 py-4">
                <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" focusable="false">
                  <rect x="12" y="16" width="48" height="40" rx="14" fill="var(--md-surface-elevated)" />
                  <path
                    d="M22 30h28M22 40h18"
                    stroke="var(--md-border-muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="50" cy="40" r="2.4" fill="var(--md-accent)" />
                </svg>
                <div className="text-sm text-md-text-muted">No guests yet. Import a guest list to get started.</div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  redirect(`/dashboard/events/${first.slug}`)
}

