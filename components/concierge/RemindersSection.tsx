'use client'

import * as React from 'react'

import { ReminderCard } from '@/components/concierge/ReminderCard'

type Reminder = {
  id: string
  type: string
  title: string
  content: string
  scheduledAt: string
  seen: boolean
}

export function RemindersSection({ token, eventSlug }: { token: string; eventSlug: string }) {
  const [reminders, setReminders] = React.useState<Reminder[]>([])

  const fetchReminders = React.useCallback(async () => {
    try {
      const res = await fetch(
        `/api/concierge/reminders?token=${encodeURIComponent(token)}&eventSlug=${encodeURIComponent(eventSlug)}`,
        { cache: 'no-store' },
      )
      if (!res.ok) return
      const data = (await res.json()) as { reminders?: Reminder[] }
      if (Array.isArray(data.reminders)) setReminders(data.reminders)
    } catch {
      // silent
    }
  }, [token, eventSlug])

  React.useEffect(() => {
    void fetchReminders()
    const id = window.setInterval(() => void fetchReminders(), 60_000)
    return () => window.clearInterval(id)
  }, [fetchReminders])

  if (!reminders.length) return null

  return (
    <div className="space-y-3">
      {reminders.map((r) => (
        <ReminderCard key={r.id} {...r} token={token} eventSlug={eventSlug} />
      ))}
    </div>
  )
}

