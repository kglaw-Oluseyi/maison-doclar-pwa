'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'

type EventSummary = {
  id: string
  slug: string
  name: string
  status: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'border-md-border bg-md-surface text-md-text-muted',
    PUBLISHED: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
    LIVE: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    CONCLUDED: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    ARCHIVED: 'border-md-border bg-md-surface-elevated text-md-text-muted',
  }
  return (
    <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] tracking-wide', styles[status] ?? styles.DRAFT].join(' ')}>
      {status}
    </span>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [events, setEvents] = React.useState<EventSummary[]>([])

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch('/api/dashboard/events', { cache: 'no-store' }).catch(() => null)
      if (!res || !res.ok) return
      const data = (await res.json().catch(() => null)) as unknown
      if (cancelled) return
      if (isRecord(data) && Array.isArray(data.events)) {
        setEvents(
          data.events
            .filter((e) => isRecord(e))
            .map((e) => ({
              id: String(e.id),
              slug: String(e.slug),
              name: String(e.name),
              status: String(e.status ?? 'DRAFT'),
            })),
        )
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const slugMatch = pathname?.match(/\/dashboard\/events\/([^/]+)/)
  const activeSlug = slugMatch?.[1] ?? null
  const activeEvent = activeSlug ? events.find((e) => e.slug === activeSlug) : null

  const eventNav = activeSlug
    ? [
        { href: `/dashboard/events/${activeSlug}`, label: 'Overview' },
        { href: `/dashboard/events/${activeSlug}/settings`, label: 'Settings' },
        { href: `/dashboard/events/${activeSlug}/design`, label: 'Design' },
        { href: `/dashboard/events/${activeSlug}/content`, label: 'Content Cards' },
        { href: `/dashboard/events/${activeSlug}/guests`, label: 'Guests' },
        { href: `/dashboard/events/${activeSlug}/media`, label: 'Media Library' },
        { href: `/dashboard/events/${activeSlug}/pwa`, label: 'PWA' },
        { href: `/dashboard/events/${activeSlug}/features`, label: 'Features' },
        { href: `/dashboard/events/${activeSlug}/hosts`, label: 'Hosts' },
        { href: `/dashboard/events/${activeSlug}/api`, label: 'API Config' },
      ]
    : []

  return (
    <div className="min-h-[100svh] bg-md-background text-md-text-primary">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="hidden w-[280px] shrink-0 border-r border-md-border bg-md-surface/40 px-4 py-6 lg:block">
          <div className="px-2">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-md-text-muted hover:text-md-text-primary"
            >
              <span aria-hidden="true">←</span> All Events
            </a>
          </div>

          <div className="mt-4 px-2">
            <a
              href="/dashboard/manual"
              className={[
                'inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] hover:text-md-text-primary',
                pathname === '/dashboard/manual' ? 'text-md-accent' : 'text-md-text-muted',
              ].join(' ')}
            >
              Operator Manual
            </a>
          </div>

          {activeEvent ? (
            <div className="mt-6 rounded-2xl border border-md-border bg-md-surface p-4">
              <div className="truncate font-[family-name:var(--md-font-heading)] text-2xl font-light">{activeEvent.name}</div>
              <div className="mt-3">
                <Badge status={activeEvent.status} />
              </div>
            </div>
          ) : null}

          {eventNav.length ? (
            <nav className="mt-6 space-y-1">
              {eventNav.map((item) => {
                const active = pathname === item.href
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={[
                      'flex items-center rounded-xl px-3 py-2 text-sm',
                      active ? 'border-l-2 border-md-accent bg-md-surface-elevated text-md-text-primary' : 'text-md-text-muted hover:bg-md-surface-elevated hover:text-md-text-primary',
                    ].join(' ')}
                  >
                    {item.label}
                  </a>
                )
              })}
            </nav>
          ) : (
            <div className="mt-6 space-y-2 px-2 text-sm text-md-text-muted">
              <a href="/dashboard/events/new" className="inline-flex items-center rounded-xl border border-md-border px-3 py-2 hover:bg-md-surface-elevated">
                Create New Event
              </a>
              <div>Select an event to manage settings.</div>
            </div>
          )}
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}

