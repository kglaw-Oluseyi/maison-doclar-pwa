'use client'

import * as React from 'react'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { HostGuestDetail } from '@/components/host/HostGuestDetail'

type Guest = {
  id: string
  name: string
  email: string | null
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  rsvpDetails?: unknown
  tableNumber: string | null
  tags: string[]
  dietaryNotes: string | null
  specialNotes: string | null
  checkIn: { scannedAt: string; method: 'QR_SCAN' | 'MANUAL' } | null
  createdAt?: string
}

type Filter = 'ALL' | 'ARRIVING' | 'ARRIVED' | 'DECLINED' | 'VIP' | 'PENDING'

function statusBadge(status: Guest['rsvpStatus']) {
  const cls =
    status === 'ACCEPTED'
      ? 'bg-md-success/15 text-md-success'
      : status === 'DECLINED'
        ? 'bg-md-error/15 text-md-error'
        : 'bg-md-warning/15 text-md-warning'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
      <span aria-hidden="true" className="mr-2 inline-block size-1 rounded-full bg-current" />
      {status}
    </span>
  )
}

function pill(active: boolean) {
  return [
    'rounded-full border px-3 py-2 text-sm',
    active ? 'border-md-accent text-md-text-primary' : 'border-md-border text-md-text-muted',
    'hover:bg-md-surface-elevated',
  ].join(' ')
}

export function HostGuestList({
  guests,
  slug,
  showRsvpDetails,
  showExportButton,
}: {
  guests: Guest[]
  slug: string
  showRsvpDetails: boolean
  showExportButton: boolean
}) {
  const [filter, setFilter] = React.useState<Filter>('ALL')
  const [query, setQuery] = React.useState('')
  const [openId, setOpenId] = React.useState<string | null>(null)

  const selected = React.useMemo(() => guests.find((g) => g.id === openId) ?? null, [guests, openId])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return guests.filter((g) => {
      if (filter === 'ARRIVED' && !g.checkIn) return false
      if (filter === 'ARRIVING' && !(g.rsvpStatus === 'ACCEPTED' && !g.checkIn)) return false
      if (filter === 'DECLINED' && g.rsvpStatus !== 'DECLINED') return false
      if (filter === 'PENDING' && g.rsvpStatus !== 'PENDING') return false
      if (filter === 'VIP' && !g.tags.includes('VIP')) return false
      if (q && !g.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [guests, filter, query])

  return (
    <Card title="Guests" noPadding>
      <div className="p-4 space-y-4">
        <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" />

        <div className="flex flex-wrap gap-2">
          {(
            [
              ['ALL', 'All'],
              ['ARRIVING', 'Arriving'],
              ['ARRIVED', 'Arrived'],
              ['DECLINED', 'Declined'],
              ['VIP', 'VIP'],
              ['PENDING', 'Pending'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" className={pill(filter === k)} onClick={() => setFilter(k as Filter)}>
              {label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-md-border rounded-2xl border border-md-border bg-md-surface">
          {filtered.map((g) => {
            const arrived = !!g.checkIn
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setOpenId(g.id)}
                className="w-full px-4 py-4 text-left hover:bg-md-surface-elevated"
                style={{ minHeight: 56 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-1 inline-block size-2 rounded-full"
                        style={{
                          background: arrived ? 'var(--md-success)' : 'transparent',
                          border: arrived ? 'none' : '1px solid var(--md-border-muted)',
                        }}
                      />
                      <div className="truncate font-[family-name:var(--md-font-heading)] text-xl font-light">{g.name}</div>
                    </div>
                    <div className="mt-1 text-xs text-md-text-muted">
                      {g.tableNumber ? `Table ${g.tableNumber}` : '—'}
                      {g.tags.includes('VIP') ? ' · VIP' : ''}
                    </div>
                  </div>
                  <div className="shrink-0">{statusBadge(g.rsvpStatus)}</div>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-md-text-muted">No guests match this filter.</div>
          ) : null}
        </div>

        {showExportButton ? (
          <div className="pt-2">
            <button
              onClick={async () => {
                const res = await fetch(`/api/host/${slug}/guests/export`)
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${slug}-guests.csv`
                a.click()
                URL.revokeObjectURL(url)
              }}
              style={{
                padding: '12px 24px',
                border: '1px solid var(--md-accent)',
                background: 'transparent',
                color: 'var(--md-text-primary)',
                fontFamily: 'var(--md-font-body)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '24px',
                width: '100%',
                minHeight: 44,
              }}
            >
              Export Guest List
            </button>
          </div>
        ) : null}
      </div>

      <HostGuestDetail
        guest={selected}
        showRsvpDetails={showRsvpDetails}
        open={openId !== null}
        onClose={() => setOpenId(null)}
      />
    </Card>
  )
}

