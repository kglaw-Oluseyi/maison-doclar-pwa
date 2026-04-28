'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { useHostContext } from '@/components/host/HostContext'

export function HostHeader() {
  const { slug, eventName, hostName } = useHostContext()
  const [loading, setLoading] = React.useState(false)

  async function logout() {
    if (loading) return
    setLoading(true)
    try {
      await fetch(`/api/host/${encodeURIComponent(slug)}/auth/logout`, { method: 'POST' })
    } finally {
      window.location.href = `/host/${slug}/login`
    }
  }

  return (
    <header className="relative pb-4">
      <div className="absolute right-0 top-0">
        <Button type="button" variant="secondary" size="sm" loading={loading} onClick={() => void logout()}>
          Logout
        </Button>
      </div>

      <div className="text-center">
        <div className="font-[family-name:var(--md-font-heading)] text-3xl font-light">{eventName}</div>
        <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-md-accent">Host View</div>
        <div className="mt-2 text-xs text-md-text-muted">{hostName}</div>
      </div>
    </header>
  )
}

