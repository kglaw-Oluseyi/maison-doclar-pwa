import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { name: true, designConfig: true },
  })

  const config = (event?.designConfig ?? {}) as Record<string, unknown>
  const palette = (config.palette ?? {}) as Record<string, string>
  const bg = palette.background ?? '#000000'
  const accent = palette.accent ?? '#B79F85'
  const text = palette.text_primary ?? '#FFFFF0'
  const muted = palette.text_muted ?? '#888888'
  const eventName = escapeHtml(event?.name ?? 'Your Event')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${eventName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${bg};
      color: ${text};
      font-family: 'Inter', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .wordmark {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.25rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: ${accent};
      margin-bottom: 32px;
    }
    .rule {
      width: 40px;
      height: 1px;
      background: ${accent};
      margin: 0 auto 32px;
    }
    .title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(1.5rem, 6vw, 2.5rem);
      font-weight: 300;
      margin-bottom: 16px;
    }
    .message {
      font-size: 0.875rem;
      color: ${muted};
      line-height: 1.6;
      max-width: 320px;
    }
    .retry {
      margin-top: 40px;
      padding: 12px 32px;
      border: 1px solid ${accent};
      color: ${text};
      background: transparent;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      cursor: pointer;
      border-radius: 8px;
    }
    .retry:focus { outline: 2px solid ${accent}; outline-offset: 2px; }
  </style>
</head>
<body>
  <div class="wordmark">Maison Doclar</div>
  <div class="rule"></div>
  <div class="title">${eventName}</div>
  <p class="message">You are currently offline. Your saved event details are available once you reopen the app.</p>
  <button class="retry" onclick="window.location.reload()">Try Again</button>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}

