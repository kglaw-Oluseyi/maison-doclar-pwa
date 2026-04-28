'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { formatDate, formatTime } from '@/lib/format'

type ReminderType = 'GENERAL' | 'SCHEDULE' | 'DRESS_CODE' | 'TRANSPORT' | 'CUSTOM'
type ReminderChannel = 'IN_APP' | 'WHATSAPP'

type Reminder = {
  id: string
  type: ReminderType
  title: string
  content: string
  scheduledAt: string
  sentAt: string | null
  channel: ReminderChannel
}

function pill(active: boolean) {
  return [
    'rounded-full border px-3 py-1.5 text-sm',
    active ? 'border-md-accent text-md-text-primary' : 'border-md-border text-md-text-muted',
    'hover:bg-md-surface-elevated',
  ].join(' ')
}

function badge(text: string, variant: 'type' | 'channel' | 'status') {
  const cls =
    variant === 'status'
      ? text === 'sent'
        ? 'bg-md-success/15 text-md-success'
        : 'bg-md-warning/15 text-md-warning'
      : 'bg-md-surface-elevated text-md-text-muted'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs ${cls}`}>{text}</span>
}

export function RemindersManager({ eventSlug }: { eventSlug: string }) {
  const [reminders, setReminders] = React.useState<Reminder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [type, setType] = React.useState<ReminderType>('GENERAL')
  const [channel, setChannel] = React.useState<ReminderChannel>('IN_APP')
  const [title, setTitle] = React.useState('')
  const [content, setContent] = React.useState('')
  const [scheduledAt, setScheduledAt] = React.useState('')

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(eventSlug)}/reminders`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { reminders?: Reminder[] }
      if (Array.isArray(data.reminders)) setReminders(data.reminders)
    } finally {
      setLoading(false)
    }
  }, [eventSlug])

  React.useEffect(() => {
    void load()
  }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    if (!title.trim()) return setError('Title is required.')
    if (!content.trim()) return setError('Content is required.')
    if (!scheduledAt) return setError('Scheduled date/time is required.')

    setSubmitting(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(eventSlug)}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          channel,
          title: title.trim(),
          content: content.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      })
      const data = (await res.json().catch(() => null)) as any
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Unable to create reminder.')
        return
      }
      setTitle('')
      setContent('')
      setScheduledAt('')
      await load()
    } catch {
      setError('Unable to create reminder.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-4">
      <Card title="Scheduled reminders">
        {loading ? (
          <div className="text-sm text-md-text-muted">Loading…</div>
        ) : reminders.length === 0 ? (
          <div className="text-sm text-md-text-muted">No reminders scheduled.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-md-border bg-md-surface">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead className="border-b border-md-border">
                <tr className="text-left text-md-text-muted">
                  <th className="w-[14%] px-4 py-4">Type</th>
                  <th className="w-[26%] px-4 py-4">Title</th>
                  <th className="w-[26%] px-4 py-4">Scheduled</th>
                  <th className="w-[14%] px-4 py-4">Channel</th>
                  <th className="w-[20%] px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => {
                  const when = new Date(r.scheduledAt)
                  const whenText = Number.isNaN(when.getTime()) ? r.scheduledAt : `${formatDate(when)} ${formatTime(when)}`
                  return (
                    <tr key={r.id} className="border-b border-md-border last:border-b-0 hover:bg-md-surface-elevated">
                      <td className="px-4 py-4">{badge(r.type, 'type')}</td>
                      <td className="px-4 py-4 text-md-text-primary">{r.title}</td>
                      <td className="px-4 py-4 text-md-text-muted">{whenText}</td>
                      <td className="px-4 py-4">{badge(r.channel === 'IN_APP' ? 'In-App' : 'WhatsApp', 'channel')}</td>
                      <td className="px-4 py-4">
                        {badge(r.sentAt ? 'sent' : 'pending', 'status')}
                        {r.sentAt ? (
                          <div className="mt-1 text-xs text-md-text-muted">
                            Sent {formatTime(new Date(r.sentAt))}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Schedule a reminder">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Type</div>
            <div className="flex flex-wrap gap-2">
              {(['GENERAL', 'SCHEDULE', 'DRESS_CODE', 'TRANSPORT', 'CUSTOM'] as const).map((t) => (
                <button key={t} type="button" className={pill(type === t)} onClick={() => setType(t)}>
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reminder title" />

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-md-border bg-md-surface px-4 py-3 text-md-text-primary outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent"
              placeholder="Write the reminder message…"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted">
                Scheduled date/time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-md-text-primary outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent"
              />
            </div>

            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Channel</div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={pill(channel === 'IN_APP')} onClick={() => setChannel('IN_APP')}>
                  In-App
                </button>
                <button type="button" className={pill(channel === 'WHATSAPP')} onClick={() => setChannel('WHATSAPP')}>
                  WhatsApp
                </button>
              </div>
              <div className="text-xs text-md-text-muted">WhatsApp sending is configurable; in-app always delivers.</div>
            </div>
          </div>

          {error ? <div className="text-sm text-md-error">{error}</div> : null}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" loading={submitting}>
              Schedule Reminder
            </Button>
            <Button type="button" variant="secondary" onClick={() => void load()}>
              Refresh
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}

