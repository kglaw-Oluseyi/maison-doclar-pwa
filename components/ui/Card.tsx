import * as React from 'react'

function cn(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(' ')
}

export type CardProps<TAs extends React.ElementType = 'div'> = {
  as?: TAs
  title?: string
  noPadding?: boolean
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<TAs>, 'as' | 'children' | 'className'>

export function Card<TAs extends React.ElementType = 'div'>({
  as,
  title,
  noPadding,
  className,
  children,
  ...props
}: CardProps<TAs>) {
  const Comp = (as ?? 'div') as React.ElementType

  return (
    <Comp
      className={cn(
        'rounded-2xl border border-md-border bg-md-surface',
        noPadding ? 'p-0' : 'p-6',
        className,
      )}
      {...props}
    >
      {title ? (
        <div className={cn(noPadding ? 'px-6 pt-6' : '', 'mb-4')}>
          <div
            className="font-[family-name:var(--md-font-heading)] text-[11px] uppercase tracking-[0.15em] text-md-accent"
          >
            {title}
          </div>
        </div>
      ) : null}
      {children}
    </Comp>
  )
}

