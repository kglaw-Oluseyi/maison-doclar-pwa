import * as React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

import { generateDashboardSessionToken } from '@/lib/auth'

type FormState = { error: string | null }

function EyeIcon(props: React.SVGProps<SVGSVGElement> & { open: boolean }) {
  const { open, ...rest } = props
  return open ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" {...rest}>
      <path
        fill="currentColor"
        d="M12 5c5.2 0 9.6 3.3 11 7-1.4 3.7-5.8 7-11 7S2.4 15.7 1 12c1.4-3.7 5.8-7 11-7Zm0 2c-3.9 0-7.3 2.3-8.7 5 1.4 2.7 4.8 5 8.7 5s7.3-2.3 8.7-5c-1.4-2.7-4.8-5-8.7-5Zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" {...rest}>
      <path
        fill="currentColor"
        d="M3.3 2.3a1 1 0 0 1 1.4 0l17 17a1 1 0 1 1-1.4 1.4l-2.2-2.2c-1.8.9-3.9 1.5-6.1 1.5-5.2 0-9.6-3.3-11-7 1-2.6 3.2-5 6.1-6.3L3.3 3.7a1 1 0 0 1 0-1.4ZM12 7c-.9 0-1.8.2-2.6.5l1.7 1.7c.3-.1.6-.2.9-.2a2.8 2.8 0 0 1 2.8 2.8c0 .3-.1.6-.2.9l1.7 1.7c.3-.8.5-1.7.5-2.6A4.8 4.8 0 0 0 12 7Zm-8.7 5c1.4 2.7 4.8 5 8.7 5 1.6 0 3.2-.4 4.6-1l-2.1-2.1a4.8 4.8 0 0 1-6.4-6.4L6 5.4C4.6 6.4 3.6 7.9 3.3 9.5c-.2.9-.2 1.7 0 2.5Z"
      />
    </svg>
  )
}

function WarningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 2c.4 0 .77.2 1 .54l9 14.5c.24.38.25.86.03 1.25-.22.39-.64.63-1.08.63H3.05c-.44 0-.86-.24-1.08-.63a1.2 1.2 0 0 1 .03-1.25l9-14.5C11.23 2.2 11.6 2 12 2Zm0 6.4a1 1 0 0 0-1 1v4.9a1 1 0 1 0 2 0V9.4a1 1 0 0 0-1-1Zm0 8.9a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
      />
    </svg>
  )
}

function PasswordField() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="w-full">
      <label
        htmlFor="password"
        className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted"
      >
        Password
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={open ? 'text' : 'password'}
          className={[
            'h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 pr-12 text-md-text-primary',
            'outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent',
          ].join(' ')}
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          aria-label={open ? 'Hide password' : 'Show password'}
          className={[
            'absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-md-text-muted',
            'hover:text-md-text-primary',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-md-accent',
          ].join(' ')}
          onClick={() => setOpen((v) => !v)}
        >
          <EyeIcon open={open} />
        </button>
      </div>
    </div>
  )
}

async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  'use server'

  const password = process.env.DASHBOARD_PASSWORD
  const secret = process.env.SESSION_SECRET
  if (!password || !secret) {
    return {
      error: 'Server misconfigured: missing DASHBOARD_PASSWORD and/or SESSION_SECRET.',
    }
  }

  const provided = formData.get('password')
  if (typeof provided !== 'string' || provided.length === 0) {
    return { error: 'Please enter your password.' }
  }

  if (provided !== password) {
    return { error: 'Incorrect password.' }
  }

  const tokenResult = await generateDashboardSessionToken()
  if (!tokenResult.ok) {
    return { error: 'Server misconfigured: could not generate session token.' }
  }

  cookies().set('md-dashboard-session', tokenResult.token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 2,
  })

  redirect('/dashboard')
}

function LoginFormClient(props: { action: (prev: FormState, formData: FormData) => Promise<FormState> }) {
  'use client'

  const { useFormState } = require('react-dom') as typeof import('react-dom')
  const [state, formAction] = useFormState(props.action, { error: null })

  return (
    <form action={formAction} className="space-y-5">
      <PasswordField />
      {state.error ? (
        <div className="inline-flex items-center gap-2 text-sm text-md-error">
          <WarningIcon className="text-md-error" />
          <span>{state.error}</span>
        </div>
      ) : null}
      <Button type="submit" variant="primary" size="lg" className="w-full">
        Sign in
      </Button>
    </form>
  )
}

export default async function DashboardLoginPage() {
  const missing = [
    !process.env.DASHBOARD_PASSWORD ? 'DASHBOARD_PASSWORD' : null,
    !process.env.SESSION_SECRET ? 'SESSION_SECRET' : null,
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-[100svh] bg-md-background text-md-text-primary">
      <div className="mx-auto flex min-h-[100svh] max-w-[480px] flex-col justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <div className="font-[family-name:var(--md-font-heading)] text-3xl font-light text-md-accent">
            Maison Doclar OS
          </div>
          <div className="mt-2 text-sm text-md-text-muted">Dashboard access</div>
        </div>

        {missing.length ? (
          <div className="mb-6 rounded-2xl border border-md-border bg-md-surface p-5 text-sm">
            <div className="font-[family-name:var(--md-font-heading)] text-lg font-light text-md-text-primary">
              Configuration required
            </div>
            <div className="mt-2 text-md-text-muted">
              Missing environment variables: <span className="text-md-accent">{missing.join(', ')}</span>
            </div>
            <div className="mt-2 text-md-text-muted">
              Ensure they are set in Vercel (Production) or in `.env.local` (local dev).
            </div>
          </div>
        ) : null}

        <Card title="Sign in">
          <LoginFormClient action={loginAction} />
        </Card>
      </div>
    </div>
  )
}

