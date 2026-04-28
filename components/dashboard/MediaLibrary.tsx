'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'

type MediaItem = { name: string; url: string; type: string; size: number }

function iconFor(type: string) {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '▶'
  if (type === 'application/pdf') return 'PDF'
  return 'FILE'
}

export function MediaLibrary({ slug }: { slug: string }) {
  const [items, setItems] = React.useState<MediaItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/media`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Unable to load media')
      const data = (await res.json()) as { items: MediaItem[] }
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Unable to load media')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void load()
  }, [slug])

  async function upload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/media`, { method: 'POST', body: fd })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Upload failed')
      }
      await load()
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function remove(name: string) {
    if (!confirm(`Delete ${name}?`)) return
    const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/media/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? 'Delete failed')
      return
    }
    await load()
  }

  return (
    <div className="space-y-5">
      <div
        className="rounded-3xl border border-dashed border-md-border bg-md-surface p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) void upload(file)
        }}
      >
        <div className="text-sm text-md-text-muted">Drag & drop files here, or choose a file.</div>
        <div className="mt-4">
          <input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void upload(f)
            }}
          />
        </div>
        {uploading ? <div className="mt-3 text-sm text-md-text-muted">Uploading…</div> : null}
      </div>

      {error ? <div className="text-sm text-md-error">{error}</div> : null}
      {loading ? <div className="text-sm text-md-text-muted">Loading…</div> : null}

      {!loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.name} className="rounded-2xl border border-md-border bg-md-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-md-text-primary truncate">{it.name}</div>
                  <div className="mt-1 text-xs text-md-text-muted">{it.type}</div>
                </div>
                <div className="shrink-0 rounded-xl border border-md-border bg-md-surface-elevated px-2 py-1 text-xs text-md-text-muted">
                  {iconFor(it.type)}
                </div>
              </div>
              {it.type.startsWith('image/') ? (
                <img src={it.url} alt="" className="mt-4 h-40 w-full rounded-xl object-cover border border-md-border" />
              ) : (
                <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-md-border bg-md-surface-elevated text-md-text-muted">
                  {iconFor(it.type)}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void navigator.clipboard.writeText(it.url)}
                >
                  Copy URL
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => void remove(it.name)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 ? <div className="text-sm text-md-text-muted">No media uploaded yet.</div> : null}
        </div>
      ) : null}
    </div>
  )
}

