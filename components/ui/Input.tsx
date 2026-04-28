import * as React from 'react'

function cn(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(' ')
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

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, id, className, ...props }: InputProps) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  const helperId = helperText ? `${inputId}-helper` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-md-text-muted"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          'h-11 w-full rounded-xl border border-md-border bg-md-surface px-4 text-md-text-primary',
          'placeholder:text-md-text-subtle',
          'outline outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-md-accent',
          error ? 'border-md-error/60' : '',
          className,
        )}
        {...props}
      />
      {helperText ? (
        <div id={helperId} className="mt-2 text-sm text-md-text-muted">
          {helperText}
        </div>
      ) : null}
      {error ? (
        <div id={errorId} className="mt-2 inline-flex items-center gap-2 text-sm text-md-error">
          <WarningIcon className="text-md-error" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  )
}

