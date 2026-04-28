'use client'

import * as React from 'react'

import { Card } from '@/components/ui/Card'

type GuestSummary = {
  id: string
  name: string
  createdAt: string
}

function daysAgo(iso: string): number {
  const d = new Date(iso)
  const now = new Date()
  if (Number.isNaN(d.getTime())) return 0
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)))
}

export function AwaitingResponseList({ guests }: { guests: GuestSummary[] }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Card title="Awaiting response" noPadding>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-md-surface-elevated"
        style={{ minHeight: 44 }}
      >
        <div className="text-[11px] uppercase tracking-[0.22em] text-md-accent">AWAITING RESPONSE</div>
        <span className="inline-flex items-center gap-2 text-sm text-md-text-muted">
          <span className="rounded-full bg-md-surface-elevated px-3 py-1 text-xs text-md-text-muted">{guests.length}</span>
          <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 180ms ease' }}>›</span>
        </span>
      </button>

      {open ? (
        <div className="px-5 pb-5">
          {guests.length === 0 ? (
            <div className="text-sm text-md-text-muted">All invited guests have responded.</div>
          ) : (
            <div className="space-y-2">
              {guests.map((g) => (
                <div key={g.id} className="rounded-xl border border-md-border bg-md-surface-elevated px-4 py-3">
                  <div className="font-[family-name:var(--md-font-heading)] text-lg font-light">{g.name}</div>
                  <div className="mt-1 text-xs text-md-text-muted">Invited {daysAgo(g.createdAt)} days ago</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </Card>
  )
}

