import { prisma } from '@/lib/prisma'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDateInTimezone } from '@/lib/format'

export default async function DashboardIndexPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      date: true,
      timezone: true,
      status: true,
      _count: { select: { guests: true } },
      guests: { select: { rsvpStatus: true } },
    },
  })

  const pills = ['ALL', 'DRAFT', 'PUBLISHED', 'LIVE', 'CONCLUDED', 'ARCHIVED'] as const

  return (
    <div>
      <DashboardHeader />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">All events</div>
              <div className="mt-2 font-[family-name:var(--md-font-heading)] text-4xl font-light">Operator cockpit</div>
            </div>
            <a href="/dashboard/events/new">
              <Button type="button" variant="primary">
                Create New Event
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            {pills.map((p) => (
              <a
                key={p}
                href={p === 'ALL' ? '/dashboard' : `/dashboard?status=${p}`}
                className="rounded-full border border-md-border bg-md-surface px-3 py-1.5 text-xs tracking-wide text-md-text-muted hover:bg-md-surface-elevated"
              >
                {p === 'ALL' ? 'All' : p}
              </a>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {events.map((e) => {
              const accepted = e.guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length
              return (
                <Card key={e.id} title={e.name} className="p-0">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate font-[family-name:var(--md-font-heading)] text-2xl font-light">
                          {e.name}
                        </div>
                        <div className="mt-2 text-sm text-md-text-muted">
                          {formatDateInTimezone(e.date, e.timezone)}
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-md-border bg-md-surface px-2.5 py-1 text-[11px] tracking-wide text-md-text-muted">
                        {e.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-md-border bg-md-surface p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Guests</div>
                        <div className="mt-2 text-2xl font-light text-md-text-primary">{e._count.guests}</div>
                      </div>
                      <div className="rounded-2xl border border-md-border bg-md-surface p-4">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Accepted</div>
                        <div className="mt-2 text-2xl font-light text-md-text-primary">{accepted}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/events/${e.slug}`}
                        className="rounded-xl border border-md-border bg-md-surface px-3 py-2 text-sm text-md-text-primary hover:bg-md-surface-elevated"
                      >
                        View Portal
                      </a>
                      <a
                        href={`/dashboard/events/${e.slug}`}
                        className="rounded-xl border border-md-border bg-md-surface px-3 py-2 text-sm text-md-text-primary hover:bg-md-surface-elevated"
                      >
                        Open Dashboard
                      </a>
                      <a
                        href={`/dashboard/events/${e.slug}/settings`}
                        className="rounded-xl border border-md-border bg-md-surface px-3 py-2 text-sm text-md-text-primary hover:bg-md-surface-elevated"
                      >
                        Edit Settings
                      </a>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

