'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate, formatTime } from '@/lib/format'

type GuestRequestStatus = 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED'

type Row = {
  id: string
  type: string
  message: string
  status: GuestRequestStatus
  operatorNote: string | null
  createdAt: string
  updatedAt: string
  guest: { id: string; name: string; email: string | null }
}

function statusBadge(status: GuestRequestStatus) {
  const cls =
    status === 'PENDING'
      ? 'bg-md-warning/15 text-md-warning'
      : status === 'ACKNOWLEDGED'
        ? 'bg-md-accent/15 text-md-accent'
        : 'bg-md-success/15 text-md-success'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
      <span aria-hidden="true" className="mr-2 inline-block size-1 rounded-full bg-current" />
      {status}
    </span>
  )
}

function typeBadge(type: string) {
  return (
    <span className="inline-flex items-center rounded-full bg-md-surface-elevated px-3 py-1 text-xs text-md-text-muted">
      {type}
    </span>
  )
}

export function RequestsTable({ eventSlug }: { eventSlug: string }) {
  const [rows, setRows] = React.useState<Row[]>([])
  const [filter, setFilter] = React.useState<'ALL' | GuestRequestStatus>('ALL')
  const [query, setQuery] = React.useState('')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState<Record<string, boolean>>({})

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(eventSlug)}/requests`, { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as { requests?: Row[] }
    if (Array.isArray(data.requests)) setRows(data.requests)
  }, [eventSlug])

  React.useEffect(() => {
    void load()
  }, [load])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter !== 'ALL' && r.status !== filter) return false
      if (!q) return true
      const hay = `${r.guest.name} ${r.guest.email ?? ''} ${r.message} ${r.type}`.toLowerCase()
      return hay.includes(q)
    })
  }, [rows, filter, query])

  function toggleRow(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  async function patchRow(id: string, patch: { status?: GuestRequestStatus; operatorNote?: string }) {
    setSaving((m) => ({ ...m, [id]: true }))
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(eventSlug)}/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) return
      const updated = (await res.json()) as Row
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } finally {
      setSaving((m) => ({ ...m, [id]: false }))
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Guest, type, message…" />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((k) => {
            const active = filter === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={[
                  'rounded-full border px-3 py-1.5 text-sm',
                  active ? 'border-md-accent text-md-text-primary' : 'border-md-border text-md-text-muted',
                  'hover:bg-md-surface-elevated',
                ].join(' ')}
              >
                {k === 'ALL' ? 'All' : k[0] + k.slice(1).toLowerCase()}
              </button>
            )
          })}
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-md-border bg-md-surface">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="border-b border-md-border">
            <tr className="text-left text-md-text-muted">
              <th className="w-[20%] px-4 py-4">Guest</th>
              <th className="w-[12%] px-4 py-4">Type</th>
              <th className="w-[34%] px-4 py-4">Message</th>
              <th className="w-[18%] px-4 py-4">Status</th>
              <th className="w-[16%] px-4 py-4">Submitted</th>
              <th className="w-[4%] px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-md-text-muted">
                  No requests.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isExpanded = expandedId === r.id
                const msg = !isExpanded && r.message.length > 80 ? `${r.message.slice(0, 80)}…` : r.message
                const created = new Date(r.createdAt)
                const when = Number.isNaN(created.getTime()) ? r.createdAt : `${formatDate(created)} ${formatTime(created)}`
                return (
                  <React.Fragment key={r.id}>
                    <tr
                      className="border-b border-md-border/70 hover:bg-md-surface-elevated"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleRow(r.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') toggleRow(r.id)
                      }}
                    >
                      <td className="px-4 py-4 align-top">
                        <div className="text-md-text-primary">{r.guest.name}</div>
                        <div className="mt-1 text-xs text-md-text-muted">{r.guest.email ?? '—'}</div>
                      </td>
                      <td className="px-4 py-4 align-top">{typeBadge(r.type)}</td>
                      <td className="px-4 py-4 align-top text-md-text-muted">{msg}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-3">
                          {statusBadge(r.status)}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-xs text-md-text-muted">{when}</td>
                      <td className="px-4 py-4 align-top">
                        <button
                          type="button"
                          aria-label={isExpanded ? 'Collapse request' : 'Expand request'}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRow(r.id)
                          }}
                          className="text-md-accent"
                          style={{
                            display: 'inline-block',
                            transform: isExpanded ? 'rotate(90deg)' : 'none',
                            transition: 'transform 180ms ease',
                          }}
                        >
                          ›
                        </button>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="border-b border-md-border last:border-b-0">
                        <td colSpan={6} className="px-4 pb-4">
                          <div className="mt-2 grid gap-4 md:grid-cols-2">
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Status</div>
                              <div style={{ marginTop: 8 }}>
                                <select
                                  value={r.status}
                                  onChange={(e) => void patchRow(r.id, { status: e.target.value as GuestRequestStatus })}
                                  className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary outline outline-0 focus-visible:outline-2 focus-visible:outline-md-accent"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                                  <option value="RESOLVED">RESOLVED</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Operator note</div>
                              <div style={{ marginTop: 8 }}>
                                <input
                                  defaultValue={r.operatorNote ?? ''}
                                  onBlur={(e) => void patchRow(r.id, { operatorNote: e.target.value })}
                                  placeholder="Add note…"
                                  className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary outline outline-0 focus-visible:outline-2 focus-visible:outline-md-accent"
                                />
                              </div>
                            </div>
                          </div>

                          {saving[r.id] ? <div className="mt-3 text-xs text-md-text-muted">Saving…</div> : null}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

