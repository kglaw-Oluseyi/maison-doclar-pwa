'use client'

import * as React from 'react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function HostAccessCard({ slug }: { slug: string }) {
  const [hostUrl, setHostUrl] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    setHostUrl(`${window.location.origin}/host/${slug}`)
  }, [slug])

  async function copy() {
    try {
      await navigator.clipboard.writeText(hostUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <Card title="Host Access">
      <div className="space-y-4">
        <div className="text-sm text-md-text-muted">
          Share this link with your event host. They will have read-only access to their event.
        </div>

        <div className="rounded-2xl border border-md-border bg-md-surface p-4">
          <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Host login URL</div>
          <div className="mt-2 break-all text-sm text-md-text-primary">{hostUrl}</div>
          <div className="mt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => void copy()} disabled={!hostUrl}>
              {copied ? 'Copied' : 'Copy URL'}
            </Button>
          </div>
          {!hostUrl ? <div className="mt-3 text-xs text-md-text-muted">Preparing URL…</div> : null}
        </div>

        <div className="rounded-2xl border border-md-border bg-md-surface p-4">
          <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Seeded credentials</div>
          <div className="mt-2 text-sm text-md-text-muted">
            Email: <span className="text-md-text-primary">host@maisondoclar.com</span>
          </div>
          <div className="mt-1 text-sm text-md-text-muted">
            Password: <span className="text-md-text-primary">maison-host-2026</span>
          </div>
          <div className="mt-3 text-xs text-md-text-muted">Note: change this password after onboarding.</div>
        </div>
      </div>
    </Card>
  )
}

