'use client'

import * as React from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { CheckInResult, type GuestSummary } from '@/components/qr/CheckInResult'

import { formatTime } from '@/lib/format'

export type GuestWithCard = {
  id: string
  name: string
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  tableNumber: string | null
  dietaryNotes: string | null
  specialNotes: string | null
  tags: string[]
  checkIn: { scannedAt: string; method: 'QR_SCAN' | 'MANUAL' } | null
  accessCard: { releasedAt: string | null; invalidatedAt: string | null; qrToken: string } | null
}

type ValidateResponse =
  | { result: 'SUCCESS' | 'DUPLICATE'; message: string; checkedInAt?: string; guest: GuestSummary }
  | { result: 'INVALID'; message: string }

async function validateToken(qrToken: string): Promise<ValidateResponse> {
  const res = await fetch('/api/qr/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken, scannedBy: 'MANUAL' }),
  })
  const data: unknown = await res.json().catch(() => null)
  if (!data || typeof data !== 'object') return { result: 'INVALID', message: 'Invalid response.' }
  return data as ValidateResponse
}

function badgeVariant(status: GuestWithCard['rsvpStatus']) {
  if (status === 'ACCEPTED') return 'accepted' as const
  if (status === 'DECLINED') return 'declined' as const
  return 'pending' as const
}

export function ManualCheckIn({ guests }: { guests: GuestWithCard[]; eventSlug: string }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<ValidateResponse | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return guests
    return guests.filter((g) => g.name.toLowerCase().includes(q))
  }, [guests, query])

  return (
    <Card title="Manual check-in">
      <div className="space-y-4">
        <Button type="button" variant="secondary" onClick={() => setOpen((v) => !v)}>
          {open ? 'Close manual check-in' : 'Manual check-in'}
        </Button>

        {open ? (
          <div className="space-y-4">
            <Input
              label="Search guests"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Start typing a name…"
              autoComplete="off"
            />

            {result ? (
              <CheckInResult
                result={result.result}
                message={result.message}
                checkedInAt={'checkedInAt' in result ? result.checkedInAt : undefined}
                guest={'guest' in result ? result.guest : undefined}
              />
            ) : null}

            <div className="grid gap-2">
              {filtered.map((g) => {
                const arrived = Boolean(g.checkIn)
                const hasCard = Boolean(g.accessCard && g.accessCard.invalidatedAt === null)
                return (
                  <div
                    key={g.id}
                    className="rounded-xl border border-md-border-muted bg-md-surface-elevated p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm text-md-text-primary">{g.name}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={badgeVariant(g.rsvpStatus)}>{g.rsvpStatus}</Badge>
                          {g.tableNumber ? (
                            <span className="text-xs text-md-accent" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                              Table {g.tableNumber}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {arrived && g.checkIn ? (
                          <div className="text-xs text-md-success">
                            Arrived · {formatTime(new Date(g.checkIn.scannedAt))}
                          </div>
                        ) : null}

                        {!arrived ? (
                          hasCard && g.accessCard ? (
                            <Button
                              type="button"
                              variant="primary"
                              loading={loadingId === g.id}
                              onClick={async () => {
                                if (!g.accessCard) return
                                setLoadingId(g.id)
                                const r = await validateToken(g.accessCard.qrToken)
                                setResult(r)
                                setLoadingId(null)
                                window.setTimeout(() => setResult(null), 3000)
                              }}
                            >
                              Check in
                            </Button>
                          ) : (
                            <div className="text-xs text-md-text-muted">No pass generated</div>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

