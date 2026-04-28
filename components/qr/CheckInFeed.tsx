'use client'

import * as React from 'react'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import { formatTime } from '@/lib/format'

export type CheckInFeedEntry = {
  id: string
  guestName: string
  scannedAt: string
  method: 'QR_SCAN' | 'MANUAL'
}

export type CheckInData = {
  event: { id: string; name: string; slug: string }
  stats: { total: number; arrived: number; notArrived: number; declined: number }
  guests: Array<{
    id: string
    name: string
    rsvpStatus: string
    tableNumber: string | null
    dietaryNotes: string | null
    specialNotes: string | null
    tags: string[]
    checkIn: { scannedAt: string; method: 'QR_SCAN' | 'MANUAL' } | null
    accessCard: { releasedAt: string | null; invalidatedAt: string | null; qrToken: string } | null
  }>
}

function methodLabel(method: 'QR_SCAN' | 'MANUAL'): string {
  return method === 'MANUAL' ? 'Manual' : 'QR'
}

export function CheckInFeed({ eventSlug, initialData }: { eventSlug: string; initialData: CheckInData }) {
  const [data, setData] = React.useState<CheckInData>(initialData)
  const [entries, setEntries] = React.useState<CheckInFeedEntry[]>(() => {
    const arrived = initialData.guests
      .filter((g) => g.checkIn)
      .map((g) => ({
        id: `${g.id}-${g.checkIn?.scannedAt ?? ''}`,
        guestName: g.name,
        scannedAt: g.checkIn?.scannedAt ?? new Date().toISOString(),
        method: g.checkIn?.method ?? 'QR_SCAN',
      }))
      .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
      .slice(0, 10)
    return arrived
  })

  React.useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/checkin/${encodeURIComponent(eventSlug)}`)
        if (!res.ok) return
        const next = (await res.json()) as CheckInData
        setData(next)

        const nextEntries = next.guests
          .filter((g) => g.checkIn)
          .map((g) => ({
            id: `${g.id}-${g.checkIn?.scannedAt ?? ''}`,
            guestName: g.name,
            scannedAt: g.checkIn?.scannedAt ?? new Date().toISOString(),
            method: g.checkIn?.method ?? 'QR_SCAN',
          }))
          .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
          .slice(0, 10)

        setEntries((prev) => {
          if (prev.length === 0) return nextEntries
          if (prev[0]?.id === nextEntries[0]?.id) return nextEntries
          return nextEntries
        })
      } catch {
        // ignore
      }
    }, 5000)
    return () => window.clearInterval(interval)
  }, [eventSlug])

  const empty = entries.length === 0

  return (
    <Card title="Arrivals feed">
      <style>{`
        @keyframes md-feed-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .md-feed-anim { animation: none !important; } }
      `}</style>
      <div className="space-y-3">
        {empty ? <div className="text-sm text-md-text-muted">No arrivals yet. Check-ins will appear here.</div> : null}

        <div className="grid gap-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="md-feed-anim rounded-xl border border-md-border-muted bg-md-surface-elevated p-4"
              style={{ animation: 'md-feed-in 300ms ease both' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-md-text-primary">{e.guestName}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-md-text-muted">{formatTime(new Date(e.scannedAt))}</span>
                  <Badge variant="pending" className="bg-md-accent/10 text-md-accent">
                    {methodLabel(e.method)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expose latest stats for future use */}
        <div className="sr-only">
          {data.stats.arrived} arrived of {data.stats.total}
        </div>
      </div>
    </Card>
  )
}

