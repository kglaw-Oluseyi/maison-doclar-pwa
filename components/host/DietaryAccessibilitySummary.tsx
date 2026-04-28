'use client'

import * as React from 'react'

import { Card } from '@/components/ui/Card'

type GuestWithDetails = {
  id: string
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  dietaryNotes: string | null
  specialNotes: string | null
  rsvpDetails?: unknown
}

function splitRequirements(input: string): string[] {
  return input
    .split(/[,;\n\r]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

function countPills(values: string[]): Array<{ label: string; count: number }> {
  const map = new Map<string, { label: string; count: number }>()
  for (const v of values) {
    const key = v.toLowerCase()
    const existing = map.get(key)
    if (existing) existing.count += 1
    else map.set(key, { label: v, count: 1 })
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function DietaryAccessibilitySummary({ guests }: { guests: GuestWithDetails[] }) {
  const [open, setOpen] = React.useState(false)

  const { dietary, accessibility } = React.useMemo(() => {
    const dietaryReqs: string[] = []
    const accessibilityNeeds: string[] = []

    for (const g of guests) {
      if (g.rsvpStatus === 'ACCEPTED') {
        if (g.dietaryNotes) dietaryReqs.push(...splitRequirements(g.dietaryNotes))
        const details =
          g.rsvpDetails && typeof g.rsvpDetails === 'object' && !Array.isArray(g.rsvpDetails)
            ? (g.rsvpDetails as Record<string, unknown>)
            : null
        const dr = details?.dietaryRequirements
        if (typeof dr === 'string' && dr.trim().length) dietaryReqs.push(...splitRequirements(dr))
      }
      if (g.specialNotes) accessibilityNeeds.push(...splitRequirements(g.specialNotes))
    }

    return {
      dietary: countPills(dietaryReqs),
      accessibility: countPills(accessibilityNeeds),
    }
  }, [guests])

  const totalCount = dietary.reduce((acc, x) => acc + x.count, 0) + accessibility.reduce((acc, x) => acc + x.count, 0)
  if (dietary.length === 0 && accessibility.length === 0) return null

  return (
    <Card title="Dietary & accessibility" noPadding>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-md-surface-elevated"
        style={{ minHeight: 44 }}
      >
        <div className="text-[11px] uppercase tracking-[0.22em] text-md-accent">DIETARY & ACCESSIBILITY</div>
        <span className="inline-flex items-center gap-2 text-sm text-md-text-muted">
          <span className="rounded-full bg-md-surface-elevated px-3 py-1 text-xs text-md-text-muted">{totalCount}</span>
          <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 180ms ease' }}>›</span>
        </span>
      </button>

      {open ? (
        <div className="px-5 pb-5 space-y-4">
          {dietary.length ? (
            <div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-md-text-muted">Dietary requirements</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {dietary.map((d) => (
                  <span
                    key={d.label}
                    className="rounded-full border border-md-border bg-md-surface-elevated px-3 py-1 text-xs text-md-text-muted"
                  >
                    {d.label} × {d.count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {accessibility.length ? (
            <div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-md-text-muted">Accessibility needs</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {accessibility.map((d) => (
                  <span
                    key={d.label}
                    className="rounded-full border border-md-border bg-md-surface-elevated px-3 py-1 text-xs text-md-text-muted"
                  >
                    {d.label} × {d.count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}

