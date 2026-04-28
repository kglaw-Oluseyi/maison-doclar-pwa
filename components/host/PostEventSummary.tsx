'use client'

import { Card } from '@/components/ui/Card'

type HostStats = {
  arrived: number
  totalAccepted: number
}

type GuestSummary = {
  id: string
  name: string
  tableNumber: string | null
}

export function PostEventSummary({
  stats,
  noShows,
  slug,
}: {
  stats: HostStats
  noShows: GuestSummary[]
  slug: string
}) {
  return (
    <Card title="Post-event summary">
      <div className="space-y-4">
        <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4">
          <div className="text-[11px] uppercase tracking-[0.15em] text-md-text-muted">Final attendance</div>
          <div className="mt-2 font-[family-name:var(--md-font-heading)] text-2xl font-light">
            {stats.arrived} of {stats.totalAccepted} accepted guests arrived
          </div>
        </div>

        <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4">
          <div className="text-[11px] uppercase tracking-[0.15em] text-md-text-muted">No-shows</div>
          {noShows.length === 0 ? (
            <div className="mt-2 text-sm text-md-text-muted">None.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {noShows.map((g) => (
                <div key={g.id} className="flex items-center justify-between text-sm text-md-text-muted">
                  <span className="text-md-text-primary">{g.name}</span>
                  <span>{g.tableNumber ? `Table ${g.tableNumber}` : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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
          Download Final Report
        </button>
      </div>
    </Card>
  )
}

