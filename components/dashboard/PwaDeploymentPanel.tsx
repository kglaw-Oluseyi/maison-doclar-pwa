'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type CheckRow = { id: string; label: string; status: 'idle' | 'running' | 'pass' | 'fail'; detail?: string }

export function PwaDeploymentPanel({
  slug,
  eventId,
  status,
  installHeadline,
  installBody,
}: {
  slug: string
  eventId: string
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'CONCLUDED' | 'ARCHIVED'
  installHeadline: string
  installBody: string
}) {
  const [headline, setHeadline] = React.useState(installHeadline)
  const [body, setBody] = React.useState(installBody)
  const [savingCopy, setSavingCopy] = React.useState(false)
  const [copyDone, setCopyDone] = React.useState(false)
  const [copyErr, setCopyErr] = React.useState<string | null>(null)

  const [manifestJson, setManifestJson] = React.useState<string>('{}')
  const [manifestErr, setManifestErr] = React.useState<string | null>(null)
  const [manifestLoading, setManifestLoading] = React.useState(false)

  const [checks, setChecks] = React.useState<CheckRow[]>([
    { id: 'name-date', label: 'Event has a name and date', status: 'idle' },
    { id: 'guest-count', label: 'At least one guest has been added', status: 'idle' },
    { id: 'logo', label: 'Logo/icon has been uploaded', status: 'idle' },
    { id: 'manifest', label: 'Manifest returns 200', status: 'idle' },
    { id: 'sw', label: 'Service worker returns 200', status: 'idle' },
    { id: 'offline', label: 'Offline page returns 200', status: 'idle' },
    { id: 'cards', label: 'At least one content card is enabled', status: 'idle' },
  ])

  const [checking, setChecking] = React.useState(false)
  const [iconsUploading, setIconsUploading] = React.useState(false)
  const [iconsErr, setIconsErr] = React.useState<string | null>(null)
  const [iconsDone, setIconsDone] = React.useState(false)

  async function loadManifest() {
    setManifestErr(null)
    setManifestLoading(true)
    try {
      const res = await fetch(`/events/${encodeURIComponent(slug)}/manifest.webmanifest`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Manifest fetch failed')
      const json = await res.json()
      setManifestJson(JSON.stringify(json, null, 2))
    } catch (e: any) {
      setManifestErr(typeof e?.message === 'string' ? e.message : 'Manifest fetch failed')
    } finally {
      setManifestLoading(false)
    }
  }

  React.useEffect(() => {
    void loadManifest()
  }, [slug])

  async function saveCopy() {
    setCopyErr(null)
    setCopyDone(false)
    setSavingCopy(true)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/pwa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installHeadline: headline, installBody: body }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Unable to save')
      }
      setCopyDone(true)
      window.setTimeout(() => setCopyDone(false), 1500)
    } catch (e: any) {
      setCopyErr(typeof e?.message === 'string' ? e.message : 'Unable to save')
    } finally {
      setSavingCopy(false)
    }
  }

  async function uploadIcon(file: File) {
    setIconsErr(null)
    setIconsDone(false)
    setIconsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/pwa/icons`, { method: 'POST', body: fd })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Upload failed')
      }
      setIconsDone(true)
      window.setTimeout(() => setIconsDone(false), 1500)
    } catch (e: any) {
      setIconsErr(typeof e?.message === 'string' ? e.message : 'Upload failed')
    } finally {
      setIconsUploading(false)
    }
  }

  async function runChecks() {
    setChecking(true)
    setChecks((prev) => prev.map((c) => ({ ...c, status: 'running', detail: undefined })))
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/pwa/checks`, { method: 'POST', cache: 'no-store' })
      const data = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(data?.error ?? 'Checks failed')
      const results = data.results as Record<string, { ok: boolean; detail: string }>
      setChecks((prev) =>
        prev.map((c) => ({
          ...c,
          status: results?.[c.id]?.ok ? 'pass' : 'fail',
          detail: results?.[c.id]?.detail,
        })),
      )
    } catch (e: any) {
      setChecks((prev) => prev.map((c) => ({ ...c, status: 'fail', detail: 'Check run failed' })))
    } finally {
      setChecking(false)
    }
  }

  const allRequiredPass = checks.every((c) => c.status === 'pass')
  const canPublish = status === 'DRAFT' && allRequiredPass

  async function publish() {
    if (!confirm(`Publish this event now? Public URL: ${window.location.origin}/events/${slug}`)) return
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PUBLISHED' }),
    })
    if (!res.ok) {
      alert('Unable to publish.')
      return
    }
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Icon management</div>
        <div
          className="rounded-3xl border border-dashed border-md-border bg-md-surface p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files?.[0]
            if (f) void uploadIcon(f)
          }}
        >
          <div className="text-sm text-md-text-muted">Upload a 1024×1024 PNG master icon.</div>
          <div className="mt-4">
            <input
              type="file"
              accept="image/png"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void uploadIcon(f)
              }}
            />
          </div>
          {iconsUploading ? <div className="mt-3 text-sm text-md-text-muted">Generating icons…</div> : null}
          {iconsErr ? <div className="mt-3 text-sm text-md-error">{iconsErr}</div> : null}
          {iconsDone ? <div className="mt-3 text-sm text-md-success">Icons updated.</div> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: '192', src: `/events/${slug}/icons/192` },
            { label: '512', src: `/events/${slug}/icons/512` },
            { label: '512 maskable', src: `/events/${slug}/icons/512-maskable` },
            { label: 'Apple touch', src: `/events/${slug}/apple-touch-icon.png` },
          ].map((i) => (
            <div key={i.label} className="rounded-2xl border border-md-border bg-md-surface p-4 text-center">
              <img src={i.src} alt="" className="mx-auto h-20 w-20 rounded-2xl border border-md-border" />
              <div className="mt-3 text-xs text-md-text-muted">{i.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Install card copy</div>
        <div className="grid gap-4">
          <Input label="Install headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <Input label="Install body" value={body} onChange={(e) => setBody(e.target.value)} />
          {copyErr ? <div className="text-sm text-md-error">{copyErr}</div> : null}
          {copyDone ? <div className="text-sm text-md-success">Saved.</div> : null}
          <Button type="button" variant="primary" loading={savingCopy} onClick={() => void saveCopy()}>
            Save install copy
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Manifest preview</div>
          <Button type="button" variant="secondary" size="sm" onClick={() => void loadManifest()} disabled={manifestLoading}>
            Refresh
          </Button>
        </div>
        {manifestErr ? <div className="text-sm text-md-error">{manifestErr}</div> : null}
        <pre className="overflow-x-auto rounded-2xl border border-md-border bg-md-surface p-4 text-xs text-md-text-muted">
{manifestJson}
        </pre>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Pre-deploy checklist</div>
          <Button type="button" variant="secondary" onClick={() => void runChecks()} loading={checking}>
            Run Checks
          </Button>
        </div>
        <div className="rounded-2xl border border-md-border bg-md-surface">
          {checks.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-4 border-b border-md-border px-5 py-4 last:border-b-0">
              <div className="min-w-0">
                <div className="text-sm text-md-text-primary">{c.label}</div>
                {c.detail ? <div className="mt-1 text-xs text-md-text-muted">{c.detail}</div> : null}
              </div>
              <div className="shrink-0 text-sm">
                {c.status === 'running' ? <span className="text-md-text-muted">…</span> : null}
                {c.status === 'pass' ? <span className="text-md-success">✓</span> : null}
                {c.status === 'fail' ? <span className="text-md-error">✗</span> : null}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-md-border bg-md-surface p-5">
          <div>
            <div className="text-sm text-md-text-primary">Publish Event</div>
            <div className="mt-1 text-xs text-md-text-muted">Transitions status from DRAFT to PUBLISHED.</div>
          </div>
          <Button type="button" variant="primary" disabled={!canPublish} onClick={() => void publish()}>
            Publish
          </Button>
        </div>
      </section>
    </div>
  )
}

