'use client'

import * as React from 'react'

type LogItem = {
  id: string
  guestName: string
  type: string
  summary: string
  channel: string | null
  createdAtISO: string
}

const TYPE_STYLES: Record<string, string> = {
  INVITATION_SENT: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  PORTAL_VISITED: 'bg-md-surface text-md-text-muted border-md-border',
  RSVP_SUBMITTED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  REMINDER_DELIVERED: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  REQUEST_SUBMITTED: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  QR_REGENERATED: 'bg-red-500/10 text-red-300 border-red-500/20',
  WALLET_PASS_GENERATED: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  REQUEST_ACKNOWLEDGED: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  REQUEST_RESOLVED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
}

const LOG_TYPE_LABELS: Record<string, string> = {
  INVITATION_SENT: 'Invitation Sent',
  PORTAL_VISITED: 'Portal Visited',
  RSVP_SUBMITTED: 'RSVP Submitted',
  REMINDER_DELIVERED: 'Reminder Delivered',
  REQUEST_SUBMITTED: 'Request Submitted',
  REQUEST_ACKNOWLEDGED: 'Request Acknowledged',
  REQUEST_RESOLVED: 'Request Resolved',
  QR_REGENERATED: 'QR Regenerated',
  WALLET_PASS_GENERATED: 'Wallet Pass Generated',
}

function formatLocalDate(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function CommunicationLogTable({ eventSlug }: { eventSlug: string }) {
  const [items, setItems] = React.useState<LogItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState('')
  const [type, setType] = React.useState<string>('ALL')

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/dashboard/events/${encodeURIComponent(eventSlug)}/communication-log?page=1`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(data?.error ?? 'Failed to load')
        }
        const data = (await res.json()) as { items: LogItem[] }
        if (cancelled) return
        setItems(Array.isArray(data.items) ? data.items : [])
      } catch (e: any) {
        if (cancelled) return
        setError(typeof e?.message === 'string' ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [eventSlug])

  const types = React.useMemo(() => {
    const set = new Set<string>()
    for (const i of items) set.add(i.type)
    return ['ALL', ...Array.from(set).sort()]
  }, [items])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      const matchQ = q.length === 0 || i.guestName.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)
      const matchT = type === 'ALL' || i.type === type
      return matchQ && matchT
    })
  }, [items, query, type])

  return (
    <div className="rounded-2xl border border-md-border bg-md-surface">
      <div className="flex flex-col gap-3 border-b border-md-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guest or summary…"
          className="h-11 w-full rounded-xl border border-md-border bg-md-surface-elevated px-4 text-sm text-md-text-primary outline-none focus:ring-2 focus:ring-md-accent/30 sm:max-w-[360px]"
        />
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={[
                'h-9 rounded-full border px-3 text-xs tracking-wide',
                t === type ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted hover:bg-md-surface-elevated',
              ].join(' ')}
            >
              {t === 'ALL' ? 'All' : LOG_TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="p-4 text-sm text-md-text-muted">Loading…</div> : null}
      {error ? <div className="p-4 text-sm text-md-error">{error}</div> : null}

      {!loading && !error ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-border">
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 text-md-text-primary">{i.guestName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] tracking-wide',
                        TYPE_STYLES[i.type] ?? 'border-md-border text-md-text-muted',
                      ].join(' ')}
                    >
                      {LOG_TYPE_LABELS[i.type] ?? i.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-md-text-muted">{i.summary}</td>
                  <td className="px-4 py-3 text-md-text-muted">{i.channel ?? '—'}</td>
                  <td className="px-4 py-3 text-md-text-muted">{formatLocalDate(i.createdAtISO)}</td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-sm text-md-text-muted" colSpan={5}>
                    No entries.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

