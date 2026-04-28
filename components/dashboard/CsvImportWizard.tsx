'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'

type Step = 1 | 2 | 3 | 4

type PwaField =
  | 'name'
  | 'email'
  | 'tableNumber'
  | 'tags'
  | 'dietaryNotes'
  | 'accessibilityNotes'
  | 'specialNotes'
  | 'osGuestId'
  | 'invitationChannel'
  | 'groupName'

const FIELD_LABELS: Record<PwaField, string> = {
  name: 'Name (required)',
  email: 'Email',
  tableNumber: 'Table Number',
  tags: 'Tags (comma-separated)',
  dietaryNotes: 'Dietary Notes',
  accessibilityNotes: 'Accessibility Notes',
  specialNotes: 'Special Notes',
  osGuestId: 'OS Guest ID',
  invitationChannel: 'Invitation Channel',
  groupName: 'Group Name',
}

const STORAGE_KEY = 'md-csv-import-v1'

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    const next = text[i + 1]
    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        field += c
      }
      continue
    }
    if (c === '"') {
      inQuotes = true
      continue
    }
    if (c === ',') {
      cur.push(field)
      field = ''
      continue
    }
    if (c === '\n') {
      cur.push(field)
      field = ''
      rows.push(cur)
      cur = []
      continue
    }
    if (c === '\r') continue
    field += c
  }
  cur.push(field)
  rows.push(cur)
  const headers = (rows.shift() ?? []).map((h) => h.trim())
  return { headers, rows: rows.filter((r) => r.some((x) => x.trim().length > 0)) }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function CsvImportWizard({ slug }: { slug: string }) {
  const [step, setStep] = React.useState<Step>(1)
  const [fileName, setFileName] = React.useState<string>('')
  const [headers, setHeaders] = React.useState<string[]>([])
  const [rows, setRows] = React.useState<string[][]>([])
  const [mapping, setMapping] = React.useState<Record<string, PwaField | ''>>({})
  const [errors, setErrors] = React.useState<string[]>([])
  const [importing, setImporting] = React.useState(false)
  const [result, setResult] = React.useState<{ created: number; updated: number; skipped: number; errorsCsv?: string } | null>(null)

  React.useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as any
      if (parsed?.headers && parsed?.rows) {
        setStep(parsed.step ?? 1)
        setFileName(parsed.fileName ?? '')
        setHeaders(parsed.headers ?? [])
        setRows(parsed.rows ?? [])
        setMapping(parsed.mapping ?? {})
      }
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, fileName, headers, rows, mapping }),
      )
    } catch {
      // ignore
    }
  }, [step, fileName, headers, rows, mapping])

  function validateMapping(): string[] {
    const errs: string[] = []
    const mapped = Object.values(mapping)
    if (!mapped.includes('name')) errs.push('You must map a column to Name.')
    return errs
  }

  function mappedPreviewRow(r: string[]): Record<string, string> {
    const out: Record<string, string> = {}
    headers.forEach((h, idx) => {
      const field = mapping[h]
      if (!field) return
      out[field] = r[idx] ?? ''
    })
    return out
  }

  function validateRow(mapped: Record<string, string>, rowIndex: number): string[] {
    const errs: string[] = []
    if (!mapped.name || !mapped.name.trim()) errs.push(`Row ${rowIndex + 2}: missing Name`)
    if (mapped.invitationChannel && !['WHATSAPP', 'EMAIL', 'MANUAL'].includes(mapped.invitationChannel.trim().toUpperCase())) {
      errs.push(`Row ${rowIndex + 2}: invalid Invitation Channel`)
    }
    return errs
  }

  async function handleImport() {
    setErrors([])
    setResult(null)
    const mapErrs = validateMapping()
    if (mapErrs.length) {
      setErrors(mapErrs)
      setStep(2)
      return
    }

    setImporting(true)
    try {
      const mappedRows = rows.map((r, idx) => ({ index: idx, mapped: mappedPreviewRow(r), raw: r }))
      const res = await fetch(`/api/dashboard/events/${encodeURIComponent(slug)}/guests/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers,
          mapping,
          rows,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setErrors([data?.error ?? 'Import failed'])
        return
      }
      const data = (await res.json()) as { created: number; updated: number; skipped: number; errorsCsv?: string }
      setResult(data)
      window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      setErrors(['Import failed'])
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['Upload', 'Map fields', 'Preview', 'Import'] as const).map((label, i) => (
          <div
            key={label}
            className={[
              'rounded-full border px-3 py-1.5 text-xs tracking-wide',
              step === (i + 1) ? 'border-md-accent bg-md-accent/15 text-md-accent' : 'border-md-border text-md-text-muted',
            ].join(' ')}
          >
            {label}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div
          className="rounded-3xl border border-dashed border-md-border bg-md-surface p-10 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (!file) return
            if (!file.name.toLowerCase().endsWith('.csv')) {
              setErrors(['Please upload a .csv file.'])
              return
            }
            const reader = new FileReader()
            reader.onload = () => {
              const text = String(reader.result ?? '')
              const parsed = parseCsv(text)
              setFileName(file.name)
              setHeaders(parsed.headers)
              setRows(parsed.rows)
              const nextMap: Record<string, PwaField | ''> = {}
              parsed.headers.forEach((h) => (nextMap[h] = ''))
              setMapping(nextMap)
              setErrors([])
              setStep(2)
            }
            reader.readAsText(file)
          }}
        >
          <div className="text-sm text-md-text-muted">Drag & drop a CSV here, or choose a file.</div>
          <div className="mt-5">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  const text = String(reader.result ?? '')
                  const parsed = parseCsv(text)
                  setFileName(file.name)
                  setHeaders(parsed.headers)
                  setRows(parsed.rows)
                  const nextMap: Record<string, PwaField | ''> = {}
                  parsed.headers.forEach((h) => (nextMap[h] = ''))
                  setMapping(nextMap)
                  setErrors([])
                  setStep(2)
                }
                reader.readAsText(file)
              }}
            />
          </div>
          {fileName ? <div className="mt-4 text-sm text-md-text-muted">{fileName} · {rows.length} rows</div> : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="text-sm text-md-text-muted">Map CSV columns to PWA fields. Unmapped columns are ignored.</div>
          <div className="grid gap-3">
            {headers.map((h) => (
              <div key={h} className="grid gap-2 rounded-2xl border border-md-border bg-md-surface p-4 md:grid-cols-2 md:items-center">
                <div className="text-sm text-md-text-primary">{h}</div>
                <select
                  value={mapping[h] ?? ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value as any }))}
                  className="h-11 w-full rounded-xl border border-md-border bg-md-surface-elevated px-4 text-sm text-md-text-primary"
                >
                  <option value="">Ignore</option>
                  {(Object.keys(FIELD_LABELS) as PwaField[]).map((f) => (
                    <option key={f} value={f}>
                      {FIELD_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="text-sm text-md-text-muted">Preview the first 5 rows with your mapping.</div>
          <div className="rounded-2xl border border-md-border bg-md-surface p-4 overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.22em] text-md-text-muted">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Table</th>
                  <th className="px-3 py-2">Tags</th>
                  <th className="px-3 py-2">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-md-border">
                {rows.slice(0, 5).map((r, idx) => {
                  const mapped = mappedPreviewRow(r)
                  const errs = validateRow(mapped, idx)
                  return (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-md-text-muted">{idx + 2}</td>
                      <td className="px-3 py-2 text-md-text-primary">{mapped.name ?? ''}</td>
                      <td className="px-3 py-2 text-md-text-muted">{mapped.email ?? ''}</td>
                      <td className="px-3 py-2 text-md-text-muted">{mapped.tableNumber ?? ''}</td>
                      <td className="px-3 py-2 text-md-text-muted">{mapped.tags ?? ''}</td>
                      <td className="px-3 py-2">
                        {errs.length ? <span className="text-md-error text-xs">{errs.join('; ')}</span> : <span className="text-xs text-md-text-muted">OK</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-md-text-muted">Validation checks: Name required; Invitation Channel must be WHATSAPP/EMAIL/MANUAL if provided.</div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="text-sm text-md-text-muted">
            Ready to import <span className="text-md-text-primary">{rows.length}</span> rows.
          </div>
          <Button type="button" variant="primary" loading={importing} onClick={() => void handleImport()}>
            Import {rows.length} guests
          </Button>
          {result ? (
            <div className="rounded-2xl border border-md-border bg-md-surface p-5">
              <div className="font-[family-name:var(--md-font-heading)] text-lg font-light">Import complete</div>
              <div className="mt-2 text-sm text-md-text-muted">
                Created: {result.created} · Updated: {result.updated} · Skipped: {result.skipped}
              </div>
              {result.errorsCsv ? (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => downloadText(`${slug}-import-errors.csv`, result.errorsCsv!)}
                  >
                    Download error report
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {errors.length ? (
        <div className="rounded-2xl border border-md-border bg-md-surface p-4 text-sm text-md-error">
          {errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, (s - 1) as Step) as Step)}>
          Back
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={step === 4}
          onClick={() => {
            if (step === 2) {
              const errs = validateMapping()
              if (errs.length) return setErrors(errs)
            }
            if (step === 3) {
              const errs = validateMapping()
              if (errs.length) return setErrors(errs)
            }
            setErrors([])
            setStep((s) => Math.min(4, (s + 1) as Step) as Step)
          }}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

