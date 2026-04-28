import { Card } from '@/components/ui/Card'
import { GuestRequestForm } from '@/components/concierge/GuestRequestForm'

export function GuestRequestCard({
  enabled,
  enabledTypes,
  token,
}: {
  enabled: boolean
  enabledTypes: string[]
  token: string
}) {
  if (!enabled) return null

  return (
    <Card title="Requests">
      <div className="space-y-2">
        <div className="text-sm text-md-text-muted">
          Dietary changes, transport, accessibility, plus-one updates — send a note to the concierge team.
        </div>
        <GuestRequestForm token={token} enabledTypes={enabledTypes} />
      </div>
    </Card>
  )
}

