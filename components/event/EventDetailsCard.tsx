import * as React from 'react'

import { Card } from '@/components/ui/Card'

export type EventDetailsCardProps = {
  description: string | null
  dressCode: string | null
}

export function EventDetailsCard({ description, dressCode }: EventDetailsCardProps) {
  return (
    <Card title="Details">
      <div className="space-y-4">
        {description ? <p className="text-sm leading-relaxed text-md-text-primary">{description}</p> : null}
        {dressCode ? (
          <div className="rounded-xl border border-md-border-muted bg-md-surface-elevated p-4">
            <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Dress code</div>
            <div className="mt-2 text-sm text-md-text-primary">{dressCode}</div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

