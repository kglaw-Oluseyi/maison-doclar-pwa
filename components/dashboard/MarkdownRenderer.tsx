'use client'

import * as React from 'react'

import type { MdInline, MdNode } from '@/lib/markdown'
import { parseMarkdown } from '@/lib/markdown'

function Inline({ nodes }: { nodes: MdInline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.type === 'text') return <React.Fragment key={i}>{n.text}</React.Fragment>
        if (n.type === 'code')
          return (
            <code key={i} className="rounded bg-md-surface-elevated px-1.5 py-0.5 text-[0.95em] text-md-text-primary">
              {n.text}
            </code>
          )
        if (n.type === 'em')
          return (
            <em key={i} className="italic">
              <Inline nodes={n.children} />
            </em>
          )
        if (n.type === 'strong')
          return (
            <strong key={i} className="font-semibold text-md-text-primary">
              <Inline nodes={n.children} />
            </strong>
          )
        if (n.type === 'link')
          return (
            <a
              key={i}
              href={n.href}
              target="_blank"
              rel="noreferrer"
              className="text-md-accent underline decoration-md-accent/40 underline-offset-4 hover:decoration-md-accent"
            >
              <Inline nodes={n.children} />
            </a>
          )
        return null
      })}
    </>
  )
}

function Blocks({ nodes }: { nodes: MdNode[] }) {
  return (
    <div className="space-y-4">
      {nodes.map((n, i) => {
        if (n.type === 'heading') {
          const Tag = n.level === 1 ? 'h2' : n.level === 2 ? 'h3' : 'h4'
          return (
            <Tag
              key={i}
              className={[
                'font-[family-name:var(--md-font-heading)] font-light text-md-text-primary',
                n.level === 1 ? 'text-3xl' : n.level === 2 ? 'text-2xl' : 'text-xl',
              ].join(' ')}
            >
              <Inline nodes={n.content} />
            </Tag>
          )
        }
        if (n.type === 'hr') return <hr key={i} className="border-md-border" />
        if (n.type === 'paragraph')
          return (
            <p key={i} className="text-sm leading-7 text-md-text-muted">
              <Inline nodes={n.content} />
            </p>
          )
        if (n.type === 'blockquote')
          return (
            <blockquote key={i} className="rounded-2xl border border-md-border bg-md-surface-elevated px-5 py-4">
              <Blocks nodes={n.children} />
            </blockquote>
          )
        if (n.type === 'list')
          return n.ordered ? (
            <ol key={i} className="list-decimal space-y-2 pl-6 text-sm leading-7 text-md-text-muted">
              {n.items.map((item, j) => (
                <li key={j}>
                  <Blocks nodes={item} />
                </li>
              ))}
            </ol>
          ) : (
            <ul key={i} className="list-disc space-y-2 pl-6 text-sm leading-7 text-md-text-muted">
              {n.items.map((item, j) => (
                <li key={j}>
                  <Blocks nodes={item} />
                </li>
              ))}
            </ul>
          )
        if (n.type === 'codeblock')
          return (
            <pre key={i} className="overflow-x-auto rounded-2xl border border-md-border bg-md-surface p-4 text-xs text-md-text-muted">
              <code>{n.code}</code>
            </pre>
          )
        return null
      })}
    </div>
  )
}

export function MarkdownRenderer({ source }: { source: string }) {
  const nodes = React.useMemo(() => parseMarkdown(source), [source])
  return <Blocks nodes={nodes} />
}

