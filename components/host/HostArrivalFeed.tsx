'use client'

import * as React from 'react'

import { Card } from '@/components/ui/Card'
import { formatTime } from '@/lib/format'

type Arrival = {
  guestName: string
  scannedAt: string
  method: 'QR_SCAN' | 'MANUAL'
  tableNumber: string | null
  tags: string[]
}

function methodLabel(m: Arrival['method']): string {
  return m === 'MANUAL' ? 'Manual' : 'QR'
}

export function HostArrivalFeed({
  slug,
  initialArrivals,
  showVipAlerts,
}: {
  slug: string
  initialArrivals: Arrival[]
  showVipAlerts: boolean
}) {
  const [arrivals, setArrivals] = React.useState<Arrival[]>(initialArrivals)
  const prefersReducedMotion = React.useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  React.useEffect(() => {
    let mounted = true
    async function load() {
      const res = await fetch(`/api/host/${encodeURIComponent(slug)}/arrivals`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { arrivals?: Arrival[] }
      if (!mounted) return
      if (Array.isArray(data.arrivals)) setArrivals(data.arrivals)
    }

    const id = window.setInterval(() => void load(), 10_000)
    return () => {
      mounted = false
      window.clearInterval(id)
    }
  }, [slug])

  return (
    <Card title="Arrivals" noPadding>
      <style>{`
        @keyframes mdSlideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .md-arrival-anim { animation: none !important; } }
      `}</style>
      <div className="p-4">
        {arrivals.length === 0 ? (
          <div className="text-sm text-md-text-muted">No arrivals yet.</div>
        ) : (
          <div>
            {arrivals.slice(0, 20).map((a) => {
              const d = new Date(a.scannedAt)
              const time = Number.isNaN(d.getTime()) ? '' : formatTime(d)
              const isVip = a.tags.includes('VIP')
              return (
                <div
                  key={`${a.guestName}-${a.scannedAt}`}
                  className={`${prefersReducedMotion ? '' : 'md-arrival-anim'}`}
                  style={{
                    borderLeft:
                      isVip && showVipAlerts ? '3px solid var(--md-accent)' : '3px solid var(--md-border)',
                    background: isVip && showVipAlerts ? 'rgba(183, 159, 133, 0.06)' : 'transparent',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    borderRadius: '0 8px 8px 0',
                    minHeight: 56,
                    animation: prefersReducedMotion ? undefined : 'mdSlideIn 300ms ease',
                  }}
                >
                  {isVip && showVipAlerts ? (
                    <span
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.15em',
                        color: 'var(--md-accent)',
                        textTransform: 'uppercase',
                      }}
                    >
                      VIP
                    </span>
                  ) : null}
                  <p style={{ fontFamily: 'var(--md-font-heading)', fontSize: '1.1rem', color: 'var(--md-text-primary)' }}>
                    {a.guestName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--md-text-muted)' }}>
                    {time} · {a.method === 'QR_SCAN' ? 'QR' : 'Manual'}
                    {a.tableNumber ? ` · Table ${a.tableNumber}` : ''}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

