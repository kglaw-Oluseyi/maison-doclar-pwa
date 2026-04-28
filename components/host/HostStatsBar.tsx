import { Card } from '@/components/ui/Card'

export function HostStatsBar(props: {
  totalInvited: number
  totalResponded: number
  totalNotResponded: number
  totalAccepted: number
  arrived: number
  notArrived: number
  totalDeclined: number
}) {
  const section1 = [
    { label: 'Total invited', value: props.totalInvited, tone: 'var(--md-text-primary)' },
    { label: 'Responded', value: props.totalResponded, tone: 'var(--md-accent)' },
    { label: 'Not responded', value: props.totalNotResponded, tone: 'var(--md-warning)' },
    { label: 'Accepted', value: props.totalAccepted, tone: 'var(--md-success)' },
  ] as const

  const section2 = [
    { label: 'Arrived', value: props.arrived, tone: 'var(--md-success)' },
    { label: 'Not yet arrived', value: props.notArrived, tone: 'var(--md-text-muted)' },
    { label: 'Declined', value: props.totalDeclined, tone: 'var(--md-error)' },
  ] as const

  return (
    <Card noPadding>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {section1.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-md-border bg-md-surface-elevated px-3 py-3"
              style={{ minHeight: 72 }}
            >
              <div
                className="font-[family-name:var(--md-font-heading)] font-light"
                style={{ color: t.tone, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', lineHeight: 1.1 }}
              >
                {t.value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.15em] text-md-text-muted">{t.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {section2.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-md-border bg-md-surface-elevated px-3 py-3"
              style={{ minHeight: 72 }}
            >
              <div
                className="font-[family-name:var(--md-font-heading)] font-light"
                style={{ color: t.tone, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', lineHeight: 1.1 }}
              >
                {t.value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.15em] text-md-text-muted">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

