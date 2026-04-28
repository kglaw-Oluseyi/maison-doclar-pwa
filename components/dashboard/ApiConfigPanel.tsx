'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type KeyRow = { id: string; label: string; createdAtISO: string; lastUsedAtISO: string | null }

const PERMS = [
  { id: 'read:guests', label: 'Read guests' },
  { id: 'write:checkins', label: 'Write check-ins' },
  { id: 'read:checkins', label: 'Read check-ins' },
  { id: 'read:communications', label: 'Read communications' },
] as const

const ENDPOINTS = [
  { method: 'GET', path: '/api/dashboard/events', desc: 'List all events (operator)' },
  { method: 'POST', path: '/api/dashboard/events', desc: 'Create new event (operator)' },
  { method: 'PATCH', path: '/api/dashboard/events/[slug]/settings', desc: 'Update general settings' },
  { method: 'PATCH', path: '/api/dashboard/events/[slug]/design', desc: 'Update design tokens' },
  { method: 'PATCH', path: '/api/dashboard/events/[slug]/content', desc: 'Update content cards config' },
  { method: 'GET', path: '/api/dashboard/events/[slug]/guests', desc: 'List guests' },
  { method: 'POST', path: '/api/dashboard/events/[slug]/guests', desc: 'Create guest' },
  { method: 'POST', path: '/api/dashboard/events/[slug]/guests/import', desc: 'CSV import guests' },
  { method: 'GET', path: '/api/dashboard/events/[slug]/media', desc: 'List media' },
  { method: 'POST', path: '/api/dashboard/events/[slug]/media', desc: 'Upload media' },
  { method: 'PATCH', path: '/api/dashboard/events/[slug]/features', desc: 'Update feature flags' },
] as const

export function ApiConfigPanel({ slug }: { slug: string }) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [integrationMode, setIntegrationMode] = React.useState<'STANDALONE' | 'INTEGRATED' | 'HYBRID'>('STANDALONE')
  const [osBaseUrl, setOsBaseUrl] = React.useState('')
  const [osWebhookUrl, setOsWebhookUrl] = React.useState('')
  const [webhooks, setWebhooks] = React.useState<Record<string, boolean>>({
    newRsvp: true,
    rsvpUpdated: true,
    guestCheckedIn: true,
    qrRegenerated: true,
    portalVisited: false,
    requestSubmitted: false,
  })

  const WEBHOOK_ITEMS = [
    ['newRsvp', 'New RSVP received'],
    ['rsvpUpdated', 'RSVP updated'],
    ['guestCheckedIn', 'Guest checked in'],
    ['qrRegenerated', 'QR token regenerated'],
    ['portalVisited', 'Portal visited'],
    ['requestSubmitted', 'Guest request submitted'],
  ] as const

  const [keys, setKeys] = React.useState<KeyRow[]>([])
  const [showGen, setShowGen] = React.useState(false)
  const [genStep, setGenStep] = React.useState<1 | 2 | 3>(1)
  const [genLabel, setGenLabel] = React.useState('')
  const [genPerms, setGenPerms] = React.useState<Record<string, boolean>>({})
  const [rawKey, setRawKey] = React.useState<string | null>(null)
  const [confirmedSaved, setConfirmedSaved] = React.useState(false)
  const [genErr, setGenErr] = React.useState<string | null>(null)
  const [genLoading, setGenLoading] = React.useState(false)

  const [testResult, setTestResult] = React.useState<{ ok: boolean; ms: number } | null>(null)
  const [testing, setTesting] = React.useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/api-config`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Unable to load')
      const data = (await res.json()) as any
      setIntegrationMode(data.integrationMode ?? 'STANDALONE')
      setOsBaseUrl(data.osBaseUrl ?? '')
      setOsWebhookUrl(data.osWebhookUrl ?? '')
      setWebhooks(isObject(data.webhookSubscriptions) ? data.webhookSubscriptions : webhooks)
      setKeys(Array.isArray(data.keys) ? data.keys : [])
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Unable to load')
    } finally {
      setLoading(false)
    }
  }

  function isObject(v: unknown): v is Record<string, any> {
    return !!v && typeof v === 'object' && !Array.isArray(v)
  }

  React.useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  async function saveConfig(next?: Partial<{ integrationMode: string; osBaseUrl: string; osWebhookUrl: string; webhookSubscriptions: Record<string, boolean> }>) {
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/api-config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        integrationMode: next?.integrationMode ?? integrationMode,
        osBaseUrl: next?.osBaseUrl ?? osBaseUrl,
        osWebhookUrl: next?.osWebhookUrl ?? osWebhookUrl,
        webhookSubscriptions: next?.webhookSubscriptions ?? webhooks,
      }),
    })
    if (!res.ok) throw new Error('Unable to save')
  }

  async function testConnection() {
    if (!osBaseUrl) return
    setTesting(true)
    setTestResult(null)
    const start = performance.now()
    try {
      const url = `${osBaseUrl.replace(/\/$/, '')}/health`
      const res = await fetch(url, { cache: 'no-store' })
      const ms = Math.round(performance.now() - start)
      setTestResult({ ok: res.ok, ms })
    } catch {
      const ms = Math.round(performance.now() - start)
      setTestResult({ ok: false, ms })
    } finally {
      setTesting(false)
    }
  }

  async function revoke(id: string) {
    if (!confirm('Revoke this key?')) return
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/api-config/keys/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Unable to revoke')
      return
    }
    await load()
  }

  async function generateKey() {
    setGenErr(null)
    setGenLoading(true)
    try {
      const perms = Object.entries(genPerms).filter(([, v]) => v).map(([k]) => k)
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/api-config/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: genLabel, permissions: perms }),
      })
      const data = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(data?.error ?? 'Unable to generate')
      setRawKey(String(data.rawKey))
      setGenStep(3)
      await load()
    } catch (e: any) {
      setGenErr(typeof e?.message === 'string' ? e.message : 'Unable to generate')
    } finally {
      setGenLoading(false)
    }
  }

  if (loading) return <div className="text-sm text-md-text-muted">Loading…</div>

  return (
    <div className="space-y-8">
      {error ? <div className="text-sm text-md-error">{error}</div> : null}

      <section className="space-y-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Integration mode</div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              id: 'STANDALONE',
              title: 'Standalone',
              desc: 'The PWA operates independently. No OS integration. Best for: smaller events, testing, events without OS deployment.',
            },
            {
              id: 'INTEGRATED',
              title: 'Integrated',
              desc: 'PWA writes to OS. OS devices write back to PWA. Guest sync happens before event day. Check-ins sync in real time.',
            },
            {
              id: 'HYBRID',
              title: 'Hybrid',
              desc: 'Both systems operate independently and reconcile periodically. Resilient to connectivity issues on event day.',
            },
          ].map((m) => {
            const active = integrationMode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setIntegrationMode(m.id as any)
                  void saveConfig({ integrationMode: m.id })
                }}
                className={[
                  'rounded-2xl border p-5 text-left',
                  active ? 'border-md-accent bg-md-accent/10' : 'border-md-border bg-md-surface',
                ].join(' ')}
              >
                <div className="font-[family-name:var(--md-font-heading)] text-xl font-light text-md-text-primary">{m.title}</div>
                <div className="mt-2 text-sm text-md-text-muted">{m.desc}</div>
              </button>
            )
          })}
        </div>
      </section>

      {integrationMode !== 'STANDALONE' ? (
        <section className="space-y-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">OS Connection</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="OS base URL" value={osBaseUrl} onChange={(e) => setOsBaseUrl(e.target.value)} />
            <Input label="OS webhook URL" value={osWebhookUrl} onChange={(e) => setOsWebhookUrl(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void saveConfig()} disabled={testing}>
              Save connection
            </Button>
            <Button type="button" variant="secondary" loading={testing} onClick={() => void testConnection()} disabled={!osBaseUrl}>
              Test Connection
            </Button>
            {testResult ? (
              <div className="text-sm text-md-text-muted self-center">
                {testResult.ok ? 'Pass' : 'Fail'} · {testResult.ms}ms
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-md-border bg-md-surface p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Webhook subscriptions</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {WEBHOOK_ITEMS.map(([k, label]) => (
                <label key={k} className="flex items-center gap-3 rounded-2xl border border-md-border bg-md-surface-elevated px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={webhooks[k] === true}
                    onChange={(e) => {
                      const next = { ...webhooks, [k]: e.target.checked }
                      setWebhooks(next)
                      void saveConfig({ webhookSubscriptions: next })
                    }}
                  />
                  <span className="text-md-text-primary">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">API Keys</div>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setShowGen(true)
              setGenStep(1)
              setGenLabel('')
              setGenPerms({})
              setRawKey(null)
              setConfirmedSaved(false)
              setGenErr(null)
            }}
          >
            Generate New Key
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-md-border bg-md-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">
              <tr>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last used</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-border">
              {keys.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3 text-md-text-primary">{k.label}</td>
                  <td className="px-4 py-3 text-md-text-muted">{new Date(k.createdAtISO).toLocaleString()}</td>
                  <td className="px-4 py-3 text-md-text-muted">{k.lastUsedAtISO ? new Date(k.lastUsedAtISO).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <Button type="button" variant="secondary" size="sm" onClick={() => void revoke(k.id)}>
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-sm text-md-text-muted" colSpan={4}>
                    No keys yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">API endpoint reference</div>
        <div className="space-y-2">
          {ENDPOINTS.map((e) => (
            <details key={e.path} className="rounded-2xl border border-md-border bg-md-surface p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2">
                    <span className="rounded-full border border-md-border bg-md-surface-elevated px-2.5 py-1 text-[11px] text-md-text-muted">
                      {e.method}
                    </span>
                    <span className="text-sm text-md-text-primary">{e.path}</span>
                  </span>
                  <span className="text-xs text-md-text-muted">›</span>
                </div>
              </summary>
              <div className="mt-3 text-sm text-md-text-muted">{e.desc}</div>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void navigator.clipboard.writeText(`${window.location.origin}${e.path}`)}
                >
                  Copy URL
                </Button>
              </div>
            </details>
          ))}
        </div>
      </section>

      {showGen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-[760px] rounded-3xl border border-md-border bg-md-surface p-6">
            <div className="flex items-center justify-between">
              <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light">Generate API key</div>
              <button type="button" onClick={() => setShowGen(false)} className="rounded-xl border border-md-border bg-md-surface-elevated px-3 py-2 text-sm">
                Close
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(['Label', 'Permissions', 'Reveal'] as const).map((t, i) => (
                <div
                  key={t}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs tracking-wide',
                    genStep === (i + 1) ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
                  ].join(' ')}
                >
                  {t}
                </div>
              ))}
            </div>

            {genStep === 1 ? (
              <div className="mt-6 space-y-4">
                <Input label="Key label" value={genLabel} onChange={(e) => setGenLabel(e.target.value)} />
              </div>
            ) : null}

            {genStep === 2 ? (
              <div className="mt-6 space-y-3">
                {PERMS.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 rounded-2xl border border-md-border bg-md-surface-elevated px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={genPerms[p.id] === true}
                      onChange={(e) => setGenPerms((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                    />
                    <span className="text-md-text-primary">{p.label}</span>
                  </label>
                ))}
              </div>
            ) : null}

            {genStep === 3 ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-md-border bg-md-surface-elevated p-4 text-sm text-md-warning">
                  Copy this key now. It will not be shown again.
                </div>
                <div className="rounded-2xl border border-md-border bg-md-surface p-4">
                  <div className="text-xs text-md-text-muted">Raw key</div>
                  <div className="mt-2 break-all font-mono text-sm text-md-text-primary">{rawKey}</div>
                  <div className="mt-3">
                    <Button type="button" variant="secondary" size="sm" onClick={() => rawKey && navigator.clipboard.writeText(rawKey)}>
                      Copy key
                    </Button>
                  </div>
                </div>
                <label className="flex items-center gap-3 text-sm text-md-text-primary">
                  <input type="checkbox" checked={confirmedSaved} onChange={(e) => setConfirmedSaved(e.target.checked)} />
                  I have saved this key
                </label>
              </div>
            ) : null}

            {genErr ? <div className="mt-4 text-sm text-md-error">{genErr}</div> : null}

            <div className="mt-6 flex items-center justify-between">
              <Button type="button" variant="ghost" disabled={genStep === 1} onClick={() => setGenStep((s) => (s - 1) as any)}>
                Back
              </Button>
              {genStep < 3 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (genStep === 1 && !genLabel.trim()) return setGenErr('Label is required.')
                    setGenErr(null)
                    setGenStep((s) => (s + 1) as any)
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="button" variant="primary" disabled={!confirmedSaved} onClick={() => setShowGen(false)}>
                  Done
                </Button>
              )}
            </div>

            {genStep === 2 ? (
              <div className="mt-4">
                <Button type="button" variant="primary" loading={genLoading} onClick={() => void generateKey()}>
                  Generate
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

