'use client'

import * as React from 'react'

const ORDER = ['DRAFT', 'PUBLISHED', 'LIVE', 'CONCLUDED', 'ARCHIVED'] as const
type Status = (typeof ORDER)[number]

function badgeClass(status: Status): string {
  if (status === 'LIVE') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
  if (status === 'PUBLISHED') return 'border-blue-500/20 bg-blue-500/10 text-blue-300'
  if (status === 'CONCLUDED') return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
  if (status === 'ARCHIVED') return 'border-md-border bg-md-surface text-md-text-muted'
  return 'border-md-border bg-md-surface text-md-text-muted'
}

function nextOptions(current: Status): Status[] {
  const idx = ORDER.indexOf(current)
  return idx < 0 ? [] : ORDER.slice(idx + 1)
}

export function EventStatusControl({
  slug,
  initialStatus,
}: {
  slug: string
  initialStatus: Status
}) {
  const [status, setStatus] = React.useState<Status>(initialStatus)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function setNext(next: Status) {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Unable to update status')
      }
      setStatus(next)
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Unable to update status')
    } finally {
      setSaving(false)
    }
  }

  const options = nextOptions(status)

  return (
    <div className="rounded-2xl border border-md-border bg-md-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Event Status</div>
          <div className="mt-2 flex items-center gap-3">
            <span className={['inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide', badgeClass(status)].join(' ')}>
              {status}
              {status === 'LIVE' ? <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> : null}
            </span>
            {error ? <span className="text-xs text-md-error">{error}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value=""
            disabled={saving || options.length === 0}
            onChange={(e) => {
              const v = e.target.value as Status
              if (ORDER.includes(v)) void setNext(v)
            }}
            className="h-11 rounded-xl border border-md-border bg-md-surface-elevated px-4 text-sm text-md-text-primary"
          >
            <option value="" disabled>
              {options.length ? 'Change status…' : 'No further transitions'}
            </option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

