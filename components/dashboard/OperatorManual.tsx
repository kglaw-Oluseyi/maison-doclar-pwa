'use client'

import * as React from 'react'

import { MarkdownRenderer } from '@/components/dashboard/MarkdownRenderer'
import { Input } from '@/components/ui/Input'

type Doc = { id: string; title: string; source: string }

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_#[\]()>.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildIndex(docs: Doc[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const d of docs) m.set(d.id, normalize(d.source))
  return m
}

export function OperatorManual({ docs }: { docs: Doc[] }) {
  const [query, setQuery] = React.useState('')
  const [activeId, setActiveId] = React.useState(docs[0]?.id ?? '')

  const index = React.useMemo(() => buildIndex(docs), [docs])
  const q = normalize(query)

  const filtered = React.useMemo(() => {
    if (!q) return docs
    const terms = q.split(' ').filter(Boolean)
    return docs
      .map((d) => {
        const hay = index.get(d.id) ?? ''
        let score = 0
        for (const t of terms) if (hay.includes(t)) score += 1
        return { d, score }
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.d.title.localeCompare(b.d.title))
      .map((x) => x.d)
  }, [docs, q, index])

  const active = docs.find((d) => d.id === activeId) ?? docs[0]

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="max-h-[70vh] overflow-auto rounded-2xl border border-md-border bg-md-surface">
          {filtered.map((d) => {
            const on = d.id === activeId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveId(d.id)}
                className={[
                  'w-full border-b border-md-border px-4 py-3 text-left last:border-b-0',
                  on ? 'bg-md-accent/10' : 'hover:bg-md-surface-elevated',
                ].join(' ')}
              >
                <div className="text-sm text-md-text-primary">{d.title}</div>
                <div className="mt-1 text-xs text-md-text-muted">{d.id.replace(/^\d+-/, '').replaceAll('-', ' ')}</div>
              </button>
            )
          })}
          {filtered.length === 0 ? <div className="px-4 py-4 text-sm text-md-text-muted">No results.</div> : null}
        </div>
      </aside>

      <article className="min-w-0">
        <div className="rounded-2xl border border-md-border bg-md-surface p-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">{active?.title}</div>
          <div className="mt-4">
            <MarkdownRenderer source={active?.source ?? ''} />
          </div>
        </div>
      </article>
    </div>
  )
}

