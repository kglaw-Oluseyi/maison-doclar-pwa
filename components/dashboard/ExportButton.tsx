'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'

export type ExportButtonProps = {
  slug: string
}

export function ExportButton({ slug }: ExportButtonProps) {
  const [loading, setLoading] = React.useState(false)

  async function onClick() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/guests/export`, { method: 'GET' })
      if (!res.ok) return
      const blob = await res.blob()

      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl

      const cd = res.headers.get('Content-Disposition')
      const filename =
        cd && cd.includes('filename=')
          ? cd.split('filename=')[1]?.trim().replaceAll('"', '') || `${slug}-guests.csv`
          : `${slug}-guests.csv`
      a.download = filename

      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button type="button" variant="primary" loading={loading} onClick={onClick}>
      Export CSV
    </Button>
  )
}

