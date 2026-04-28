import { Card } from '@/components/ui/Card'

export interface EventSummaryCardProps {
  eventName: string
  eventDate: Date
  venue: string
  daysUntilEvent: number
  eventMode: 'pre-event' | 'event-day' | 'post-event'
}

export function EventSummaryCard({ eventName, venue, daysUntilEvent, eventMode }: EventSummaryCardProps) {
  return (
    <Card noPadding>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @media (prefers-reduced-motion: reduce) { .md-pulse { animation: none !important; } }
      `}</style>
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="truncate font-[family-name:var(--md-font-heading)] text-3xl font-light">{eventName}</div>
          <div className="mt-2 text-sm text-md-text-muted">{venue}</div>
        </div>

        <div className="shrink-0">
          {eventMode === 'pre-event' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-md-accent/15 px-3 py-1 text-xs text-md-accent">
              {daysUntilEvent} days to go
            </span>
          ) : eventMode === 'event-day' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-md-success/15 px-3 py-1 text-xs text-md-success">
              <span aria-hidden="true" className="md-pulse inline-block size-1.5 rounded-full bg-md-success" style={{ animation: 'pulse 900ms ease-in-out infinite' }} />
              Today
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-md-surface-elevated px-3 py-1 text-xs text-md-text-muted">
              Concluded
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

