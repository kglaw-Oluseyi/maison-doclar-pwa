'use client'

import * as React from 'react'

import { useTheme } from '@/components/dashboard/ThemeProvider'
import { Button } from '@/components/ui/Button'

function SunMoonIcon(props: React.SVGProps<SVGSVGElement> & { theme: 'dark' | 'light' }) {
  const { theme, ...rest } = props
  return theme === 'dark' ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" {...rest}>
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 1 3.46-10.9 1 1 0 0 1-.38 1.82A4 4 0 1 0 16 12a1 1 0 0 1 1.82-.38A5.98 5.98 0 0 1 12 18Z"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" {...rest}>
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 1 6-6 6.01 6.01 0 0 1-6 6Zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm0-4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm8-8a1 1 0 0 1 1 1 1 1 0 1 1-2 0 1 1 0 0 1 1-1ZM4 12a1 1 0 0 1 1 1 1 1 0 1 1-2 0 1 1 0 0 1 1-1Zm13.66-6.66a1 1 0 0 1 0 1.42l-.71.71a1 1 0 0 1-1.42-1.42l.71-.71a1 1 0 0 1 1.42 0ZM7.47 15.53a1 1 0 0 1 0 1.42l-.71.71a1 1 0 0 1-1.42-1.42l.71-.71a1 1 0 0 1 1.42 0Zm10.19 1.42a1 1 0 0 1-1.42 0l-.71-.71a1 1 0 1 1 1.42-1.42l.71.71a1 1 0 0 1 0 1.42ZM7.47 8.47a1 1 0 0 1-1.42 0l-.71-.71A1 1 0 1 1 6.76 6.34l.71.71a1 1 0 0 1 0 1.42Z"
      />
    </svg>
  )
}

export type DashboardHeaderProps = {
  eventName?: string
}

export function DashboardHeader({ eventName }: DashboardHeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="border-b border-md-border">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-6">
        <div className="flex flex-col gap-1">
          <div className="font-[family-name:var(--md-font-heading)] text-2xl font-light text-md-accent">
            Maison Doclar OS
          </div>
          {eventName ? <div className="text-sm text-md-text-muted">{eventName}</div> : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-md-border bg-md-surface px-4 text-sm text-md-text-primary hover:bg-md-surface-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-md-accent"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            <SunMoonIcon theme={theme} />
          </button>
          <Button type="button" variant="secondary" onClick={() => (window.location.href = '/dashboard/signout')}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}

