'use client'

import * as React from 'react'

import { InstallPromptCard } from './InstallPromptCard'
import { IosInstallGuide } from './IosInstallGuide'
import { InAppBrowserBanner } from './InAppBrowserBanner'
import { OfflineBanner } from './OfflineBanner'
import { EventSwitcher } from './EventSwitcher'

interface PwaOrchestratorProps {
  slug: string
  eventId: string
  guestId: string
  eventName: string
  installHeadline: string
  installBody: string
}

type InstallState = 'idle' | 'prompt-ready' | 'installing' | 'installed' | 'dismissed'

function isIos(ua: string): boolean {
  return /iphone|ipad|ipod/i.test(ua)
}

function isInAppBrowser(ua: string): boolean {
  return /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|TikTok/i.test(ua)
}

function getDismissedUntil(slug: string): number {
  try {
    const val = localStorage.getItem(`md-install-dismissed-${slug}`)
    return val ? Number.parseInt(val, 10) : 0
  } catch {
    return 0
  }
}

function setDismissed(slug: string, until: number) {
  try {
    localStorage.setItem(`md-install-dismissed-${slug}`, String(until))
  } catch {
    // ignore
  }
}

export function PwaOrchestrator({
  slug,
  eventId,
  guestId,
  eventName,
  installHeadline,
  installBody,
}: PwaOrchestratorProps) {
  const [installState, setInstallState] = React.useState<InstallState>('idle')
  const [isOffline, setIsOffline] = React.useState(false)
  const [showIosGuide, setShowIosGuide] = React.useState(false)
  const [showInAppBanner, setShowInAppBanner] = React.useState(false)
  const [activeEvents, setActiveEvents] = React.useState<string[]>([])
  const [standalone, setStandalone] = React.useState(false)

  const deferredPrompt = React.useRef<BeforeInstallPromptEvent | null>(null)

  const logEvent = React.useCallback(
    async (type: string) => {
      try {
        await fetch('/api/pwa/install-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            guestId,
            eventType: type,
            userAgent: navigator.userAgent,
          }),
        })
      } catch {
        // non-fatal
      }
    },
    [eventId, guestId],
  )

  React.useEffect(() => {
    const ua = navigator.userAgent

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`/events/${slug}/sw.js`, { scope: `/events/${slug}/` }).catch(() => {})
    }

    // Standalone detection (client-only)
    const mq = window.matchMedia('(display-mode: standalone)')
    const applyStandalone = () => setStandalone(mq.matches)
    applyStandalone()
    mq.addEventListener?.('change', applyStandalone)

    // Offline detection
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    setIsOffline(!navigator.onLine)

    // In-app browser banner
    if (isInAppBrowser(ua)) {
      setShowInAppBanner(true)
      return () => {
        mq.removeEventListener?.('change', applyStandalone)
        window.removeEventListener('offline', handleOffline)
        window.removeEventListener('online', handleOnline)
      }
    }

    // Already installed
    if (mq.matches) {
      setInstallState('installed')
    }

    // Dismiss cooldown
    const dismissedUntil = getDismissedUntil(slug)
    if (Date.now() < dismissedUntil) {
      return () => {
        mq.removeEventListener?.('change', applyStandalone)
        window.removeEventListener('offline', handleOffline)
        window.removeEventListener('online', handleOnline)
      }
    }

    // Track active events (for iOS standalone switcher)
    try {
      const stored = localStorage.getItem('md-active-events')
      const list: unknown = stored ? JSON.parse(stored) : []
      const events = Array.isArray(list) ? (list.filter((x) => typeof x === 'string') as string[]) : []
      if (!events.includes(slug)) {
        events.push(slug)
        localStorage.setItem('md-active-events', JSON.stringify(events))
      }
      if (events.length > 1) setActiveEvents(events)
    } catch {
      // ignore
    }

    // iOS — show guide after delay
    if (isIos(ua)) {
      const timer = window.setTimeout(() => {
        setShowIosGuide(true)
        void logEvent('prompt_shown')
      }, 10000)
      return () => {
        window.clearTimeout(timer)
        mq.removeEventListener?.('change', applyStandalone)
        window.removeEventListener('offline', handleOffline)
        window.removeEventListener('online', handleOnline)
      }
    }

    // Android/Desktop — wait for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      const timer = window.setTimeout(() => {
        setInstallState('prompt-ready')
        void logEvent('prompt_shown')
      }, 10000)
      window.setTimeout(() => window.clearTimeout(timer), 11000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      mq.removeEventListener?.('change', applyStandalone)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [slug, logEvent])

  async function handleInstall() {
    if (!deferredPrompt.current) return
    setInstallState('installing')
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      setInstallState('installed')
      void logEvent('install_accepted')
    } else {
      setInstallState('dismissed')
      void logEvent('install_dismissed')
    }
    deferredPrompt.current = null
  }

  function handleDismiss() {
    setDismissed(slug, Date.now() + 24 * 60 * 60 * 1000)
    setInstallState('dismissed')
    void logEvent('install_dismissed')
  }

  return (
    <>
      {isOffline ? <OfflineBanner /> : null}
      {showInAppBanner ? <InAppBrowserBanner /> : null}

      {installState === 'prompt-ready' ? (
        <InstallPromptCard headline={installHeadline} body={installBody} onInstall={handleInstall} onDismiss={handleDismiss} />
      ) : null}

      {showIosGuide && !standalone ? (
        <IosInstallGuide
          eventName={eventName}
          onDismiss={() => {
            setShowIosGuide(false)
            handleDismiss()
          }}
        />
      ) : null}

      {standalone && activeEvents.length > 1 ? <EventSwitcher activeEvents={activeEvents} currentSlug={slug} /> : null}
    </>
  )
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }
}

