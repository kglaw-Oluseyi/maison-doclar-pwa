export type MdNode =
  | { type: 'heading'; level: 1 | 2 | 3; content: MdInline[] }
  | { type: 'paragraph'; content: MdInline[] }
  | { type: 'hr' }
  | { type: 'blockquote'; children: MdNode[] }
  | { type: 'list'; ordered: boolean; items: MdNode[][] }
  | { type: 'codeblock'; lang: string | null; code: string }

export type MdInline =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: MdInline[] }
  | { type: 'em'; children: MdInline[] }
  | { type: 'code'; text: string }
  | { type: 'link'; href: string; children: MdInline[] }

function clampHeading(n: number): 1 | 2 | 3 {
  if (n <= 1) return 1
  if (n === 2) return 2
  return 3
}

function parseInlines(input: string): MdInline[] {
  const out: MdInline[] = []
  let i = 0
  const pushText = (t: string) => {
    if (!t) return
    const prev = out[out.length - 1]
    if (prev && prev.type === 'text') prev.text += t
    else out.push({ type: 'text', text: t })
  }

  while (i < input.length) {
    const ch = input[i] ?? ''

    // inline code
    if (ch === '`') {
      const j = input.indexOf('`', i + 1)
      if (j !== -1) {
        const code = input.slice(i + 1, j)
        out.push({ type: 'code', text: code })
        i = j + 1
        continue
      }
    }

    // link [text](href)
    if (ch === '[') {
      const close = input.indexOf(']', i + 1)
      const openParen = close !== -1 ? input.indexOf('(', close + 1) : -1
      const closeParen = openParen !== -1 ? input.indexOf(')', openParen + 1) : -1
      if (close !== -1 && openParen === close + 1 && closeParen !== -1) {
        const label = input.slice(i + 1, close)
        const href = input.slice(openParen + 1, closeParen)
        out.push({ type: 'link', href, children: parseInlines(label) })
        i = closeParen + 1
        continue
      }
    }

    // strong **text**
    if (input.startsWith('**', i)) {
      const j = input.indexOf('**', i + 2)
      if (j !== -1) {
        const inner = input.slice(i + 2, j)
        out.push({ type: 'strong', children: parseInlines(inner) })
        i = j + 2
        continue
      }
    }

    // emphasis *text*
    if (ch === '*') {
      const j = input.indexOf('*', i + 1)
      if (j !== -1) {
        const inner = input.slice(i + 1, j)
        out.push({ type: 'em', children: parseInlines(inner) })
        i = j + 1
        continue
      }
    }

    if (ch) pushText(ch)
    i += 1
  }

  return out
}

export function parseMarkdown(src: string): MdNode[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const nodes: MdNode[] = []

  let idx = 0
  const takeWhile = (pred: (l: string) => boolean): string[] => {
    const out: string[] = []
    while (idx < lines.length) {
      const line = lines[idx]
      if (line === undefined) break
      if (!pred(line)) break
      out.push(line)
      idx += 1
    }
    return out
  }

  while (idx < lines.length) {
    const line = lines[idx]
    if (line === undefined) break
    if (!line.trim()) {
      idx += 1
      continue
    }

    // fenced code
    const fenceMatch = line.match(/^```(\S+)?\s*$/)
    if (fenceMatch) {
      const lang = fenceMatch[1] ?? null
      idx += 1
      const codeLines = takeWhile((l) => !l.startsWith('```'))
      if (idx < lines.length && (lines[idx] ?? '').startsWith('```')) idx += 1
      nodes.push({ type: 'codeblock', lang, code: codeLines.join('\n') })
      continue
    }

    // hr
    if (/^---\s*$/.test(line.trim())) {
      nodes.push({ type: 'hr' })
      idx += 1
      continue
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const hashes = h[1] ?? '#'
      const content = (h[2] ?? '').trim()
      const level = clampHeading(hashes.length)
      nodes.push({ type: 'heading', level, content: parseInlines(content) })
      idx += 1
      continue
    }

    // blockquote
    if (line.trimStart().startsWith('>')) {
      const qLines = takeWhile((l) => l.trimStart().startsWith('>')).map((l) => l.trimStart().replace(/^>\s?/, ''))
      nodes.push({ type: 'blockquote', children: parseMarkdown(qLines.join('\n')) })
      continue
    }

    // list (ordered or unordered)
    const ul = line.match(/^\s*-\s+(.*)$/)
    const ol = line.match(/^\s*\d+\.\s+(.*)$/)
    if (ul || ol) {
      const ordered = Boolean(ol)
      const items: MdNode[][] = []
      while (idx < lines.length) {
        const l = lines[idx]
        if (l === undefined) break
        const m = ordered ? l.match(/^\s*\d+\.\s+(.*)$/) : l.match(/^\s*-\s+(.*)$/)
        if (!m) break
        idx += 1
        items.push([{ type: 'paragraph', content: parseInlines(m[1] ?? '') }])
      }
      nodes.push({ type: 'list', ordered, items })
      continue
    }

    // paragraph (collect until blank)
    const para = takeWhile((l) => !!l.trim() && !l.startsWith('```') && !/^#{1,6}\s/.test(l) && !l.trimStart().startsWith('>') && !/^\s*-\s+/.test(l) && !/^\s*\d+\.\s+/.test(l))
    const text = para.join(' ').replace(/\s+/g, ' ').trim()
    nodes.push({ type: 'paragraph', content: parseInlines(text) })
  }

  return nodes
}

