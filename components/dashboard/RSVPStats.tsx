import * as React from 'react'

import { Card } from '@/components/ui/Card'

export type RSVPStatsProps = {
  total: number
  accepted: number
  declined: number
  pending: number
}

function StatTile(props: { label: string; value: number; colorClass: string }) {
  return (
    <Card className="p-5">
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">{props.label}</div>
        <div className={`font-[family-name:var(--md-font-heading)] text-4xl font-light ${props.colorClass}`}>
          {props.value}
        </div>
      </div>
    </Card>
  )
}

export function RSVPStats({ total, accepted, declined, pending }: RSVPStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatTile label="Total guests" value={total} colorClass="text-md-accent" />
      <StatTile label="Accepted" value={accepted} colorClass="text-md-success" />
      <StatTile label="Declined" value={declined} colorClass="text-md-error" />
      <StatTile label="Pending" value={pending} colorClass="text-md-warning" />
    </section>
  )
}

