'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asTokens(designConfig: unknown): Record<string, string> {
  if (!isRecord(designConfig)) return {}
  const tokens = (designConfig.tokens ?? {}) as unknown
  if (!isRecord(tokens)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(tokens)) if (typeof v === 'string') out[k] = v
  return out
}

function setToken(tokens: Record<string, string>, key: string, value: string) {
  return { ...tokens, [key]: value }
}

const PALETTE_KEYS = [
  ['Background', '--md-background'],
  ['Surface', '--md-surface'],
  ['Text Primary', '--md-text-primary'],
  ['Text Muted', '--md-text-muted'],
  ['Accent', '--md-accent'],
  ['Border', '--md-border'],
] as const

export function DesignEditor({ slug, initialDesignConfig }: { slug: string; initialDesignConfig: unknown }) {
  const initialTokens = asTokens(initialDesignConfig)
  const [tokens, setTokens] = React.useState<Record<string, string>>({
    '--md-background': initialTokens['--md-background'] ?? '#000000',
    '--md-surface': initialTokens['--md-surface'] ?? '#0a0a0a',
    '--md-text-primary': initialTokens['--md-text-primary'] ?? '#FFFFF0',
    '--md-text-muted': initialTokens['--md-text-muted'] ?? '#888888',
    '--md-accent': initialTokens['--md-accent'] ?? '#B79F85',
    '--md-border': initialTokens['--md-border'] ?? '#1e1e1e',
    '--md-font-heading': initialTokens['--md-font-heading'] ?? "'Cormorant Garamond', Georgia, serif",
    '--md-font-body': initialTokens['--md-font-body'] ?? "'Inter', system-ui, sans-serif",
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  async function save() {
    setError(null)
    setDone(false)
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/design`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designConfig: { tokens } }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? 'Unable to save design.')
        return
      }
      setDone(true)
      window.setTimeout(() => setDone(false), 1500)
    } catch {
      setError('Unable to save design.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="text-sm text-md-text-muted">
          Edit your palette and fonts. Changes are previewed live; saving writes to the event’s design tokens.
        </div>

        <div className="space-y-4">
          {PALETTE_KEYS.map(([label, key]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-[160px] text-sm text-md-text-muted">{label}</div>
              <input
                type="color"
                value={tokens[key] ?? '#000000'}
                onChange={(e) => setTokens((t) => setToken(t, key, e.target.value))}
                className="h-11 w-11 rounded-lg border border-md-border bg-md-surface"
              />
              <input
                value={tokens[key] ?? ''}
                onChange={(e) => setTokens((t) => setToken(t, key, e.target.value))}
                className="h-11 flex-1 rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Heading font token</div>
            <input
              value={tokens['--md-font-heading'] ?? ''}
              onChange={(e) => setTokens((t) => setToken(t, '--md-font-heading', e.target.value))}
              className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
            />
          </div>
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.12em] text-md-text-muted">Body font token</div>
            <input
              value={tokens['--md-font-body'] ?? ''}
              onChange={(e) => setTokens((t) => setToken(t, '--md-font-body', e.target.value))}
              className="h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary"
            />
          </div>
        </div>

        {error ? <div className="text-sm text-md-error">{error}</div> : null}
        {done ? <div className="text-sm text-md-success">Saved.</div> : null}

        <Button type="button" variant="primary" loading={saving} onClick={() => void save()}>
          Save design
        </Button>
      </div>

      <div className="rounded-2xl border border-md-border p-6" style={{ background: tokens['--md-surface'], color: tokens['--md-text-primary'] }}>
        <div style={{ color: tokens['--md-accent'], letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Live preview
        </div>
        <div
          style={{
            fontFamily: tokens['--md-font-heading'],
            fontSize: '2.25rem',
            fontWeight: 300,
            marginTop: 12,
          }}
        >
          Event preview
        </div>
        <div style={{ fontFamily: tokens['--md-font-body'], color: tokens['--md-text-muted'], marginTop: 10 }}>
          This panel mirrors the guest portal palette, button, and badge styling.
        </div>
        <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: tokens['--md-border'], background: tokens['--md-background'] }}>
          <div style={{ fontFamily: tokens['--md-font-heading'], fontSize: '1.4rem', fontWeight: 300 }}>Sample card</div>
          <div style={{ fontFamily: tokens['--md-font-body'], color: tokens['--md-text-muted'], marginTop: 8, fontSize: '0.9rem' }}>
            Text muted + border + accent badge.
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: tokens['--md-border'], background: tokens['--md-surface'] }}>
              Button
            </div>
            <div className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: tokens['--md-accent'], color: tokens['--md-accent'], background: 'rgba(183, 159, 133, 0.15)' }}>
              Badge
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

