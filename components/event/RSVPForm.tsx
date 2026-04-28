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
  groupMembers?: Array<{ name: string; dietaryNotes?: string }>
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

  const [group, setGroup] = React.useState<{ id: string; maxSize: number; overflowMessage: string } | null>(null)
  const [groupMembers, setGroupMembers] = React.useState<Array<{ name: string; dietaryNotes: string }>>([])

  React.useEffect(() => {
    let cancelled = false
    async function loadGroup() {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/group?token=${encodeURIComponent(token)}`, {
        cache: 'no-store',
      }).catch(() => null)
      if (!res || !res.ok) return
      const data = (await res.json().catch(() => null)) as { group?: any } | null
      if (cancelled) return
      const g = data?.group
      if (g && typeof g === 'object') {
        setGroup({
          id: String(g.id),
          maxSize: Number(g.maxSize) || 1,
          overflowMessage: typeof g.overflowMessage === 'string' ? g.overflowMessage : 'Need to add more guests? Send us a message through the app.',
        })
      }
    }
    void loadGroup()
    return () => {
      cancelled = true
    }
  }, [slug, token])

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
      groupMembers:
        groupMembers.length > 0
          ? groupMembers
              .map((m) => ({ name: m.name.trim(), dietaryNotes: m.dietaryNotes.trim() ? m.dietaryNotes.trim() : undefined }))
              .filter((m) => m.name.length > 0)
          : undefined,
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
            {group && group.maxSize > 1 ? (
              <div className="space-y-3 rounded-2xl border border-md-border bg-md-surface p-4">
                <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Group</div>
                <div className="text-sm text-md-text-muted">
                  You can add up to <span className="text-md-text-primary">{group.maxSize - 1}</span> additional guest
                  {group.maxSize - 1 === 1 ? '' : 's'}.
                </div>
                <div className="space-y-3">
                  {groupMembers.map((m, idx) => (
                    <div key={idx} className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label={`Guest ${idx + 2} name`}
                        value={m.name}
                        onChange={(e) =>
                          setGroupMembers((prev) => prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))
                        }
                        placeholder="Name"
                        autoComplete="off"
                      />
                      <Input
                        label="Dietary notes (optional)"
                        value={m.dietaryNotes}
                        onChange={(e) =>
                          setGroupMembers((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, dietaryNotes: e.target.value } : x)),
                          )
                        }
                        placeholder="Allergies, preferences…"
                        autoComplete="off"
                      />
                      <div className="sm:col-span-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setGroupMembers((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  {groupMembers.length < group.maxSize - 1 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => setGroupMembers((prev) => [...prev, { name: '', dietaryNotes: '' }])}
                    >
                      Add guest
                    </Button>
                  ) : (
                    <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4 text-sm text-md-text-muted">
                      {group.overflowMessage}
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            document.getElementById('md-requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            window.dispatchEvent(new CustomEvent('md-prefill-request', { detail: { type: 'PLUS_ONE' } }))
                          }}
                        >
                          Request an extra guest
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
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

