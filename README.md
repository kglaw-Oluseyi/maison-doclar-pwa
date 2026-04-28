# Maison Doclar OS — Slice 1 (Live Event Portal)

Luxury bespoke digital guest management for private events. Built with Next.js 14 (App Router), Prisma, and PostgreSQL (Neon).

## Prerequisites

- Node.js 20+
- pnpm
- A Neon PostgreSQL database

## Clone & install

```bash
pnpm install
```

## Environment setup

Copy the example env file and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL`: Neon Postgres connection string
- `DASHBOARD_PASSWORD`: password for `/dashboard/login`
- `SESSION_SECRET`: random 32+ character string for HMAC session signing
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` in local dev

## Database setup

Push schema, then seed:

```bash
pnpm db:push
pnpm db:seed
```

## Run the dev server

```bash
pnpm dev
```

## Test the seeded guest portal

Seeded event slug:

- `maison-doclar-gala-2026`

Use one of these access tokens:

- `11111111-1111-1111-1111-111111111111`
- `22222222-2222-2222-2222-222222222222`
- `33333333-3333-3333-3333-333333333333`
- `44444444-4444-4444-4444-444444444444`
- `55555555-5555-5555-5555-555555555555`

Example:

- `http://localhost:3000/events/maison-doclar-gala-2026?token=11111111-1111-1111-1111-111111111111`

Invalid token example:

- `http://localhost:3000/events/maison-doclar-gala-2026?token=invalid`

Missing event example:

- `http://localhost:3000/events/nonexistent-event`

## Dashboard

- Dashboard URL: `http://localhost:3000/dashboard`
- Login: `http://localhost:3000/dashboard/login`

The dashboard is protected by an HMAC-based session cookie (`md-dashboard-session`) minted on successful login.

## Deploy to Vercel

1. Connect the repo to Vercel
2. Add environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `DASHBOARD_PASSWORD`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. Deploy

