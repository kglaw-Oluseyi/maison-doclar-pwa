import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

type ButtonOwnProps = {
  loading?: boolean
}

function cn(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(' ')
}

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 rounded-xl border text-sm',
    'transition-colors duration-200',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-md-accent',
    'disabled:opacity-50 disabled:pointer-events-none',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'border-md-accent bg-transparent text-md-text-primary',
          'hover:bg-md-accent/10 active:bg-md-accent/15',
        ].join(' '),
        secondary: [
          'border-md-border bg-md-surface text-md-text-primary',
          'hover:bg-md-surface-elevated active:bg-md-surface-elevated/80',
        ].join(' '),
        ghost: [
          'border-transparent bg-transparent text-md-text-primary',
          'hover:bg-md-surface-elevated active:bg-md-surface-elevated/80',
        ].join(' '),
        danger: [
          'border-md-error bg-transparent text-md-text-primary',
          'hover:bg-md-error/10 active:bg-md-error/15',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> &
  ButtonOwnProps

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, disabled, children, ...props },
  ref,
) {
  const isDisabled = Boolean(disabled || loading)

  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), loading ? 'pointer-events-none opacity-70' : '', className)}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className={cn(
            'inline-block size-4 shrink-0 rounded-full border border-current border-t-transparent',
            'animate-spin',
          )}
        />
      ) : null}
      <span className="inline-flex items-center">{children}</span>
    </button>
  )
})

