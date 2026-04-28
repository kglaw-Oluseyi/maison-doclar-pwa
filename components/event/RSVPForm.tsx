'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type RSVPStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

type RSVPDetails = {
  plusOneName?: string
  dietaryRequirements?: string
  message?: string
}

type RSVPFormProps = {
  slug: string
  token: string
  onSuccess: (nextStatus: Exclude<RSVPStatus, 'PENDING'>) => void
}

function cn(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(' ')
}

function TextAreaField(props: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  const helperId = `${props.id}-helper`
  return (
    <div className="w-full">
      <label htmlFor={props.id} className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">
        {props.label}
      </label>
      <textarea
        id={props.id}
        rows={props.rows ?? 4}
        className={cn(
          'w-full resize-none rounded-xl border border-md-border bg-md-surface px-4 py-3 text-md-text-primary',
          'placeholder:text-md-text-subtle',
          'outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent',
        )}
        placeholder={props.placeholder}
        aria-describedby={helperId}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
      <div id={helperId} className="sr-only">
        {props.label}
      </div>
    </div>
  )
}

async function postRsvp(args: {
  slug: string
  token: string
  status: 'ACCEPTED' | 'DECLINED'
  details?: RSVPDetails
}): Promise<{ ok: true; status: 'ACCEPTED' | 'DECLINED' } | { ok: false; error: string }> {
  const url = `/api/events/${encodeURIComponent(args.slug)}/rsvp?token=${encodeURIComponent(args.token)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: args.status, details: args.details }),
  })
  if (!res.ok) {
    const data: unknown = await res.json().catch(() => null)
    const error =
      typeof data === 'object' && data && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Something went wrong'
    return { ok: false, error }
  }
  return { ok: true, status: args.status }
}

export function RSVPForm({ slug, token, onSuccess }: RSVPFormProps) {
  const [step, setStep] = React.useState<1 | 2>(1)
  const [choice, setChoice] = React.useState<'ACCEPTED' | 'DECLINED' | null>(null)
  const [inflight, setInflight] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [plusOneName, setPlusOneName] = React.useState('')
  const [dietaryRequirements, setDietaryRequirements] = React.useState('')
  const [message, setMessage] = React.useState('')

  async function submitDecline() {
    setInflight(true)
    setError(null)
    const result = await postRsvp({ slug, token, status: 'DECLINED' })
    setInflight(false)
    if (!result.ok) return setError(result.error)
    onSuccess('DECLINED')
  }

  async function submitAccept() {
    setInflight(true)
    setError(null)
    const details: RSVPDetails = {
      plusOneName: plusOneName.trim() ? plusOneName.trim() : undefined,
      dietaryRequirements: dietaryRequirements.trim() ? dietaryRequirements.trim() : undefined,
      message: message.trim() ? message.trim() : undefined,
    }
    const result = await postRsvp({ slug, token, status: 'ACCEPTED', details })
    setInflight(false)
    if (!result.ok) return setError(result.error)
    onSuccess('ACCEPTED')
  }

  return (
    <Card title="RSVP">
      <div className="space-y-6">
        {step === 1 ? (
          <div className="grid gap-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              loading={inflight && choice === 'ACCEPTED'}
              onClick={() => {
                setChoice('ACCEPTED')
                setStep(2)
              }}
              className="w-full"
            >
              I’ll be there
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              loading={inflight && choice === 'DECLINED'}
              onClick={async () => {
                setChoice('DECLINED')
                await submitDecline()
              }}
              className="w-full"
            >
              I’m unable to attend
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <Input
              label="Plus one name (optional)"
              value={plusOneName}
              onChange={(e) => setPlusOneName(e.target.value)}
              placeholder="Name"
              autoComplete="off"
            />
            <TextAreaField
              id="md-dietary"
              label="Dietary requirements (optional)"
              value={dietaryRequirements}
              onChange={setDietaryRequirements}
              placeholder="Allergies, preferences, restrictions…"
              rows={4}
            />
            <TextAreaField
              id="md-message"
              label="Message (optional)"
              value={message}
              onChange={setMessage}
              placeholder="A note for the hosts…"
              rows={4}
            />

            {error ? <div className="text-sm text-md-error">{error}</div> : null}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={inflight}
                onClick={() => {
                  setStep(1)
                  setChoice(null)
                  setError(null)
                }}
              >
                Back
              </Button>
              <Button type="button" variant="primary" size="md" loading={inflight} onClick={submitAccept}>
                Confirm
              </Button>
            </div>
          </div>
        ) : null}

        {step === 1 && error ? <div className="text-sm text-md-error">{error}</div> : null}
      </div>
    </Card>
  )
}

