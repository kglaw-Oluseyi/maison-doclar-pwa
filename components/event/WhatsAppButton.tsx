'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'

export type WhatsAppButtonProps = {
  whatsappNumber: string
  whatsappTemplate?: string | null
  guestName: string
  eventName: string
}

function buildWhatsappUrl(number: string, template: string | null | undefined, guestName: string, eventName: string): string {
  const baseUrl = `https://wa.me/${number}`

  if (!template) {
    const defaultMessage = `Hello, I'm ${guestName} reaching out about ${eventName}.`
    return `${baseUrl}?text=${encodeURIComponent(defaultMessage)}`
  }

  const message = template.replace('{guestName}', guestName).replace('{eventName}', eventName)
  return `${baseUrl}?text=${encodeURIComponent(message)}`
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  // Official WhatsApp mark path (inline SVG).
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M19.11 17.37c-.27-.14-1.59-.79-1.84-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.03-.22-.53-.44-.46-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.64 1.11 2.82c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.57.65.21 1.24.18 1.71.11.52-.08 1.59-.65 1.82-1.27.22-.61.22-1.14.16-1.25-.07-.11-.25-.18-.52-.32Z"
      />
      <path
        fill="currentColor"
        d="M16 3C9.37 3 4 8.12 4 14.42c0 2.24.69 4.32 1.87 6.07L4.64 25.8c-.08.32.22.62.54.54l5.53-1.2A12.4 12.4 0 0 0 16 25.85c6.63 0 12-5.12 12-11.43C28 8.12 22.63 3 16 3Zm0 20.86c-1.74 0-3.39-.44-4.83-1.21l-.35-.18-3.28.71.73-3.11-.2-.34a10.36 10.36 0 0 1-1.62-5.31C6.45 9.2 10.75 5.1 16 5.1S25.55 9.2 25.55 14.42 21.25 23.86 16 23.86Z"
      />
    </svg>
  )
}

export function WhatsAppButton({ whatsappNumber, whatsappTemplate, guestName, eventName }: WhatsAppButtonProps) {
  const href = buildWhatsappUrl(whatsappNumber, whatsappTemplate, guestName, eventName)

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
    >
      <span className="inline-flex items-center gap-2">
        <WhatsAppIcon />
        <span>Message Concierge</span>
      </span>
    </Button>
  )
}

