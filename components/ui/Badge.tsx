import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

function cn(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(' ')
}

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        accepted: 'bg-md-success/15 text-md-success',
        declined: 'bg-md-error/15 text-md-error',
        pending: 'bg-md-text-muted/15 text-md-text-muted',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  },
)

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      <span aria-hidden="true" className="size-1 rounded-full bg-current" />
      <span>{children}</span>
    </span>
  )
}

