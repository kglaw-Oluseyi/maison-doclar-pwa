import * as React from 'react'

function cn(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(' ')
}

export type EventShellProps = {
  children: React.ReactNode
}

export function EventShell({ children }: EventShellProps) {
  const wrapped = React.Children.map(children, (child, index) => {
    if (child === null || child === undefined || typeof child === 'boolean') return null
    return (
      <div
        className={cn(
          'md-card-enter motion-reduce:animate-none',
          'opacity-0 translate-y-2',
          'animate-[md-fade-in_400ms_ease_forwards]',
        )}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {child}
      </div>
    )
  })

  return (
    <div className="min-h-[100svh] bg-md-background text-md-text-primary">
      <header className="mx-auto max-w-[640px] px-6 pt-10">
        <div className="font-[family-name:var(--md-font-heading)] text-xs uppercase tracking-[0.22em] text-md-accent">
          Maison Doclar
        </div>
      </header>
      <main className="mx-auto max-w-[640px] px-6 pb-16 pt-10">
        <div className="flex flex-col gap-8">{wrapped}</div>
      </main>
    </div>
  )
}

