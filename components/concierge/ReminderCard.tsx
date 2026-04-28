'use client'

import * as React from 'react'

import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/format'

export interface ReminderCardProps {
  id: string
  type: string
  title: string
  content: string
  scheduledAt: string
  seen: boolean
  token: string
  eventSlug: string
}

function labelForType(type: string): string {
  if (type === 'DRESS_CODE') return 'Dress code'
  if (type === 'SCHEDULE') return 'Schedule'
  if (type === 'TRANSPORT') return 'Transport'
  if (type === 'GENERAL') return 'General'
  if (type === 'CUSTOM') return 'Notice'
  return type
}

export function ReminderCard({ id, type, title, content, scheduledAt, seen, token }: ReminderCardProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const hasDismissedRef = React.useRef(false)

  const when = React.useMemo(() => {
    const d = new Date(scheduledAt)
    return Number.isNaN(d.getTime()) ? null : d
  }, [scheduledAt])

  async function handleDismiss() {
    if (hasDismissedRef.current) {
      setCollapsed(true)
      return
    }
    hasDismissedRef.current = true
    try {
      await fetch(`/api/concierge/reminders/${id}/seen?token=${encodeURIComponent(token)}`, { method: 'POST' })
    } catch {
      // best-effort; still collapse locally
    }
    setCollapsed(true)
  }

  if (collapsed) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderLeft: '2px solid var(--md-border)',
          opacity: 0.5,
          cursor: 'pointer',
          borderRadius: 12,
          border: '1px solid var(--md-border)',
          background: 'var(--md-surface)',
        }}
        role="button"
        tabIndex={0}
        onClick={() => setCollapsed(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setCollapsed(false)
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--md-text-muted)', fontFamily: 'var(--md-font-body)' }}>
          {title}
        </span>
        <span style={{ color: 'var(--md-text-subtle)', fontSize: '0.75rem' }}>Show ›</span>
      </div>
    )
  }

  return (
    <Card
      noPadding
      className="bg-md-surface-elevated"
      style={{
        borderLeft: '4px solid var(--md-accent)',
      }}
    >
      <div className="relative p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-[11px] uppercase tracking-[0.15em] text-md-accent">{labelForType(type)}</div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss reminder"
            className="rounded-lg px-2 py-1 text-md-text-muted hover:bg-md-surface"
          >
            ×
          </button>
        </div>

        <div className="flex items-start gap-2">
          {!seen ? <span aria-hidden="true" className="mt-2 size-1.5 rounded-full bg-md-accent" /> : null}
          <div className="min-w-0">
            <div className="font-[family-name:var(--md-font-heading)] text-xl font-light">{title}</div>
            <div className="mt-1 text-sm text-md-text-muted">{content}</div>
            <div className="mt-3 text-xs text-md-text-muted">{when ? formatDate(when) : null}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

