'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type EventStatus = 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'CONCLUDED' | 'ARCHIVED'

export function EventSettingsEditor({
  slug,
  initial,
}: {
  slug: string
  initial: {
    name: string
    status: EventStatus
    timezone: string
    dateISO: string
    endDateISO: string
    location: string
    address: string
    coordinates: string
    dressCode: string
    description: string
    rsvpOpen: boolean
  }
}) {
  const [form, setForm] = React.useState(initial)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  async function save() {
    setError(null)
    setDone(false)
    if (!form.name.trim()) return setError('Event name is required.')
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          status: form.status,
          timezone: form.timezone,
          dateISO: form.dateISO,
          endDateISO: form.endDateISO ? form.endDateISO : null,
          location: form.location,
          address: form.address,
          coordinates: form.coordinates ? form.coordinates : null,
          dressCode: form.dressCode ? form.dressCode : null,
          description: form.description ? form.description : null,
          rsvpOpen: form.rsvpOpen,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Unable to save settings.')
        return
      }
      setDone(true)
      window.setTimeout(() => setDone(false), 1500)
    } catch {
      setError('Unable to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Event name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <div>
          <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EventStatus }))}
            className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
          >
            {(['DRAFT', 'PUBLISHED', 'LIVE', 'CONCLUDED', 'ARCHIVED'] as const).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Event date & time</label>
          <input
            type="datetime-local"
            value={new Date(form.dateISO).toISOString().slice(0, 16)}
            onChange={(e) => setForm((f) => ({ ...f, dateISO: new Date(e.target.value).toISOString() }))}
            className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-md-text-primary outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent"
          />
        </div>
        <div>
          <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">End date & time (optional)</label>
          <input
            type="datetime-local"
            value={form.endDateISO ? new Date(form.endDateISO).toISOString().slice(0, 16) : ''}
            onChange={(e) => setForm((f) => ({ ...f, endDateISO: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
            className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-md-text-primary outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent"
          />
        </div>
      </div>

      <Input label="Timezone (IANA)" value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))} />
      <Input label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
      <Input label="Full address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
      <Input label="Coordinates (optional)" value={form.coordinates} onChange={(e) => setForm((f) => ({ ...f, coordinates: e.target.value }))} />
      <Input label="Dress code (optional)" value={form.dressCode} onChange={(e) => setForm((f) => ({ ...f, dressCode: e.target.value }))} />

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Description (optional)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          className="w-full resize-none rounded-xl border border-md-border bg-md-surface px-4 py-3 text-sm text-md-text-primary outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent"
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-md-border bg-md-surface p-4">
        <div>
          <div className="text-sm text-md-text-primary">RSVP open</div>
          <div className="mt-1 text-xs text-md-text-muted">If closed, guests cannot submit RSVP updates.</div>
        </div>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, rsvpOpen: !f.rsvpOpen }))}
          className={[
            'h-10 rounded-full border px-3 text-xs tracking-wide',
            form.rsvpOpen ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
          ].join(' ')}
        >
          {form.rsvpOpen ? 'On' : 'Off'}
        </button>
      </div>

      {error ? <div className="text-sm text-md-error">{error}</div> : null}
      {done ? <div className="text-sm text-md-success">Saved.</div> : null}

      <Button type="button" variant="primary" loading={saving} onClick={() => void save()}>
        Save settings
      </Button>
    </div>
  )
}

