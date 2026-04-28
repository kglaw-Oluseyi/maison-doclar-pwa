'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'

const TYPE_LABELS: Record<string, string> = {
  DIETARY: 'Dietary',
  TRANSPORT: 'Transport',
  ACCESSIBILITY: 'Accessibility',
  PLUS_ONE: 'Plus One',
  GENERAL: 'General',
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M9.2 16.2 4.9 12l1.4-1.4 2.9 2.9L17.7 5l1.4 1.4-9 9a1 1 0 0 1-1.4 0Z"
      />
    </svg>
  )
}

export function GuestRequestForm({
  token,
  enabledTypes,
}: {
  token: string
  enabledTypes: string[]
}) {
  const types = enabledTypes.length ? enabledTypes : ['DIETARY', 'TRANSPORT', 'ACCESSIBILITY', 'PLUS_ONE', 'GENERAL']
  const [type, setType] = React.useState(types[0] ?? 'GENERAL')
  const [message, setMessage] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  const remaining = 1000 - message.length

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    const trimmed = message.trim()
    if (!trimmed) {
      setError('Please enter a message.')
      return
    }
    if (trimmed.length > 1000) {
      setError('Message must be under 1000 characters.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/concierge/requests?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: trimmed }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Unable to send request.')
        return
      }
      setDone(true)
    } catch {
      setError('Unable to send request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-md-border bg-md-surface p-5">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-md-accent/10 text-md-accent">
          <CheckIcon />
        </span>
        <div>
          <div className="font-[family-name:var(--md-font-heading)] text-lg font-light">Request received</div>
          <div className="mt-1 text-sm text-md-text-muted">We’ll be in touch shortly.</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {types.map((t) => {
          const active = t === type
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={[
                'rounded-full border px-3 py-1.5 text-sm',
                active ? 'border-md-accent text-md-text-primary' : 'border-md-border text-md-text-muted',
                'hover:bg-md-surface-elevated',
              ].join(' ')}
            >
              {TYPE_LABELS[t] ?? t}
            </button>
          )
        })}
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ minHeight: 80 }}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-md-border bg-md-surface px-4 py-3 text-md-text-primary outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent"
          placeholder="Tell us what you need — we’ll take care of the details."
        />
        <div className="mt-2 flex items-center justify-between text-xs text-md-text-muted">
          <span>{error ? <span className="text-md-error">{error}</span> : null}</span>
          <span>
            {message.length} / 1000
          </span>
        </div>
      </div>

      <Button type="submit" variant="primary" loading={submitting} disabled={remaining < 0}>
        Send Request
      </Button>
    </form>
  )
}

