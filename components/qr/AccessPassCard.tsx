import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { generateQrDataUrl } from '@/lib/qr'
import { formatDateInTimezone } from '@/lib/format'
import { WalletButtons } from '@/components/qr/WalletButtons'

interface AccessPassCardProps {
  guestName: string
  eventName: string
  eventDate: Date
  timezone?: string
  walletPassEnabled?: boolean
  accessToken?: string
  tableNumber: string | null
  tags: string[]
  qrToken: string
  releasedAt: Date | null
}

function formatLongDate(date: Date, timezone?: string): string {
  return timezone ? formatDateInTimezone(date, timezone) : formatDateInTimezone(date, 'Europe/London')
}

export async function AccessPassCard({
  guestName,
  eventName,
  eventDate,
  timezone,
  walletPassEnabled,
  accessToken,
  tableNumber,
  tags,
  qrToken,
  releasedAt,
}: AccessPassCardProps) {
  const isVip = tags.includes('VIP')

  if (!releasedAt || releasedAt > new Date()) {
    return (
      <Card title="Access pass">
        <div className="space-y-3">
          <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">Access pass</div>
          <div className="text-sm text-md-text-muted">Your access pass will be available closer to the event.</div>
        </div>
      </Card>
    )
  }

  const qrDataUrl = await generateQrDataUrl(qrToken)

  return (
    <Card title="Access pass">
      <div className="space-y-6">
        <div className="text-center">
          <div className="font-[family-name:var(--md-font-heading)] text-3xl font-light">{guestName}</div>
          <div className="mt-2 text-sm text-md-text-muted">
            {eventName} · {formatLongDate(eventDate, timezone)}
          </div>
          {isVip ? (
            <div className="mt-4 inline-flex items-center justify-center">
              <Badge variant="pending" className="bg-md-accent/15 text-md-accent">
                VIP
              </Badge>
            </div>
          ) : null}
        </div>

        <div className="mx-auto h-px w-10 bg-md-accent" />

        <div className="mx-auto w-full max-w-[340px] rounded-2xl border border-md-border bg-md-surface-elevated p-5">
          <div className="rounded-xl bg-md-text-primary p-5">
            <img
              src={qrDataUrl}
              alt={`Access pass QR code for ${guestName}`}
              className="mx-auto block h-auto w-full"
            />
          </div>
        </div>

        <div className="text-center">
          {tableNumber ? (
            <div className="text-sm text-md-accent" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Table {tableNumber}
            </div>
          ) : null}
          <div className="mt-2 text-sm text-md-text-muted">Present this pass at entry.</div>
        </div>

        {walletPassEnabled && accessToken ? <WalletButtons accessToken={accessToken} /> : null}
      </div>
    </Card>
  )
}

