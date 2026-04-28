'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function HostLoginForm({ slug }: { slug: string }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/host/${encodeURIComponent(slug)}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Unable to sign in.')
        return
      }
      window.location.href = `/host/${slug}`
    } catch {
      setError('Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Input
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        autoComplete="email"
        placeholder="host@..."
      />

      <div className="relative">
        <Input
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-[38px] h-9 rounded-lg px-3 text-sm text-md-text-muted hover:bg-md-surface-elevated"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>

      {error ? <div className="text-sm text-md-error">{error}</div> : null}

      <Button type="submit" variant="primary" loading={loading} className="h-12 w-full">
        Sign in
      </Button>
    </form>
  )
}

