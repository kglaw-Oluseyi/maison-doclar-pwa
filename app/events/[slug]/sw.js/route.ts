import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { slug: true, updatedAt: true },
  })

  if (!event) {
    return new NextResponse('Not found', { status: 404 })
  }

  const cacheKey = `md-${event.slug}-v${event.updatedAt.getTime()}`
  const scope = `/events/${event.slug}`

  const sw = `
const CACHE_KEY = '${cacheKey}';
const SCOPE = '${scope}';
const SHELL_URLS = [
  SCOPE + '/',
  SCOPE + '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_KEY).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('md-${event.slug}-') && k !== CACHE_KEY)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!url.pathname.startsWith(SCOPE)) return;

  if (event.request.method !== 'GET') return;

  const isApiRequest = url.pathname.startsWith('/api/');
  const isNavigation = event.request.mode === 'navigate';

  if (isApiRequest) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_KEY).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then(
            (cached) => cached ?? caches.match(SCOPE + '/offline')
          )
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached ?? fetch(event.request)
    )
  );
});
`

  return new NextResponse(sw, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': `/events/${event.slug}`,
    },
  })
}

