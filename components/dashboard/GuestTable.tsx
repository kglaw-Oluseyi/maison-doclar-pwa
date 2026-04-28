'use client'

import * as React from 'react'

import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

import { formatDate } from '@/lib/format'

type RSVPStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export type GuestRow = {
  id: string
  name: string
  email: string | null
  rsvpStatus: RSVPStatus
  tags: string[]
  tableNumber: string | null
  createdAtISO: string
}

type SortColumn = 'name' | 'rsvpStatus' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export type GuestTableProps = {
  guests: GuestRow[]
}

function statusOrder(status: RSVPStatus): number {
  if (status === 'ACCEPTED') return 0
  if (status === 'PENDING') return 1
  return 2
}

function formatShortDate(iso: string): string {
  return formatDate(new Date(iso))
}

function sortIndicator(active: boolean, direction: SortDirection): string {
  if (!active) return ''
  return direction === 'asc' ? '▲' : '▼'
}

export function GuestTable({ guests }: GuestTableProps) {
  const [query, setQuery] = React.useState('')
  const [sort, setSort] = React.useState<{ column: SortColumn; direction: SortDirection }>({
    column: 'createdAt',
    direction: 'desc',
  })

  const sorted = React.useMemo(() => {
    const copy = [...guests]
    copy.sort((a, b) => {
      let cmp = 0
      if (sort.column === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else if (sort.column === 'createdAt') {
        cmp = new Date(a.createdAtISO).getTime() - new Date(b.createdAtISO).getTime()
      } else {
        cmp = statusOrder(a.rsvpStatus) - statusOrder(b.rsvpStatus)
      }
      return sort.direction === 'asc' ? cmp : -cmp
    })
    return copy
  }, [guests, sort.column, sort.direction])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((g) => {
      const email = g.email ?? ''
      return g.name.toLowerCase().includes(q) || email.toLowerCase().includes(q)
    })
  }, [sorted, query])

  function toggleSort(column: SortColumn) {
    setSort((prev) => {
      if (prev.column !== column) return { column, direction: 'asc' }
      return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const empty = filtered.length === 0

  return (
    <section className="space-y-4">
      <div className="max-w-md">
        <Input
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or email"
          autoComplete="off"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-md-border bg-md-surface">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="border-b border-md-border">
            <tr className="text-left text-md-text-muted">
              <th className="w-[28%] px-4 py-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 hover:text-md-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-md-accent"
                  onClick={() => toggleSort('name')}
                >
                  Name <span className="text-md-accent">{sortIndicator(sort.column === 'name', sort.direction)}</span>
                </button>
              </th>
              <th className="w-[18%] px-4 py-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 hover:text-md-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-md-accent"
                  onClick={() => toggleSort('rsvpStatus')}
                >
                  RSVP{' '}
                  <span className="text-md-accent">
                    {sortIndicator(sort.column === 'rsvpStatus', sort.direction)}
                  </span>
                </button>
              </th>
              <th className="w-[12%] px-4 py-4">Table</th>
              <th className="w-[18%] px-4 py-4">Tags</th>
              <th className="w-[16%] px-4 py-4">Email</th>
              <th className="w-[8%] px-4 py-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 hover:text-md-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-md-accent"
                  onClick={() => toggleSort('createdAt')}
                >
                  Created{' '}
                  <span className="text-md-accent">
                    {sortIndicator(sort.column === 'createdAt', sort.direction)}
                  </span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {empty ? (
              <tr>
                <td colSpan={6} className="px-6 py-14">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
                    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                      <rect x="10" y="14" width="44" height="36" rx="10" fill="var(--md-surface-elevated)" />
                      <path
                        d="M18 26h28M18 34h20"
                        stroke="var(--md-border-muted)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="46" cy="34" r="2" fill="var(--md-accent)" />
                    </svg>
                    <div className="text-sm text-md-text-muted">
                      No guests yet. Import a guest list to get started.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((g) => (
                <tr key={g.id} className="border-b border-md-border last:border-b-0 hover:bg-md-surface-elevated">
                  <td className="px-4 py-4 text-md-text-primary">{g.name}</td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={
                        g.rsvpStatus === 'ACCEPTED'
                          ? 'accepted'
                          : g.rsvpStatus === 'DECLINED'
                            ? 'declined'
                            : 'pending'
                      }
                    >
                      {g.rsvpStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-md-text-muted">{g.tableNumber ?? '—'}</td>
                  <td className="px-4 py-4 text-md-text-muted">{g.tags.length ? g.tags.join(', ') : '—'}</td>
                  <td className="px-4 py-4 text-md-text-muted">{g.email ?? '—'}</td>
                  <td className="px-4 py-4 text-md-text-muted">{formatShortDate(g.createdAtISO)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

