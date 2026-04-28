import { Card } from '@/components/ui/Card'

export interface CheckInStatsProps {
  stats: {
    total: number
    arrived: number
    notArrived: number
    declined: number
  }
}

function Tile(props: { label: string; value: number; color: string }) {
  return (
    <Card className="p-5">
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">{props.label}</div>
        <div className={`font-[family-name:var(--md-font-heading)] text-4xl font-light ${props.color}`}>
          {props.value}
        </div>
      </div>
    </Card>
  )
}

export function CheckInStats({ stats }: CheckInStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Tile label="Arrived" value={stats.arrived} color="text-md-success" />
      <Tile label="Not yet arrived" value={stats.notArrived} color="text-md-text-muted" />
      <Tile label="Declined" value={stats.declined} color="text-md-error" />
      <Tile label="Total" value={stats.total} color="text-md-accent" />
    </section>
  )
}

