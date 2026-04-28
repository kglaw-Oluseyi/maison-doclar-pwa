'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'

export type SaveToCalendarButtonProps = {
  slug: string
  token: string
}

export function SaveToCalendarButton({ slug, token }: SaveToCalendarButtonProps) {
  const [loading, setLoading] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  async function onClick() {
    if (loading) return
    setLoading(true)
    try {
      const url = `/api/events/${encodeURIComponent(slug)}/calendar?token=${encodeURIComponent(token)}`
      const res = await fetch(url)
      if (!res.ok) return

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `${slug}.ics`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)

      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button type="button" variant="secondary" loading={loading} onClick={onClick}>
      {saved ? 'Saved ✓' : 'Save to calendar'}
    </Button>
  )
}

