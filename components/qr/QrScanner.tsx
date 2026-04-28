'use client'

import * as React from 'react'
import jsQR from 'jsqr'

import type { GuestSummary } from '@/components/qr/CheckInResult'
import { Card } from '@/components/ui/Card'

type ValidateResponse =
  | { result: 'SUCCESS' | 'DUPLICATE'; message: string; checkedInAt?: string; guest: GuestSummary }
  | { result: 'INVALID'; message: string }

type CameraError =
  | { type: 'NOT_ALLOWED'; message: string }
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'NOT_READABLE'; message: string }
  | { type: 'UNKNOWN'; message: string }

type CameraState = 'idle' | 'loading' | 'active' | 'permission-denied' | 'unavailable'

function cornerBracketStyle(pos: 'tl' | 'tr' | 'bl' | 'br') {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 22,
    height: 22,
    borderStyle: 'solid',
  }
  if (pos === 'tl') return { ...base, top: 0, left: 0, borderWidth: '2px 0 0 2px', borderRadius: '10px 0 0 0' }
  if (pos === 'tr') return { ...base, top: 0, right: 0, borderWidth: '2px 2px 0 0', borderRadius: '0 10px 0 0' }
  if (pos === 'bl') return { ...base, bottom: 0, left: 0, borderWidth: '0 0 2px 2px', borderRadius: '0 0 0 10px' }
  return { ...base, bottom: 0, right: 0, borderWidth: '0 2px 2px 0', borderRadius: '0 0 10px 0' }
}

async function validateToken(qrToken: string): Promise<ValidateResponse> {
  const res = await fetch('/api/qr/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken }),
  })
  const data: unknown = await res.json().catch(() => null)
  if (!data || typeof data !== 'object') return { result: 'INVALID', message: 'Invalid response.' }
  return data as ValidateResponse
}

async function getCamera(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
  } catch {
    return await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  }
}

type ScanResult = 'idle' | 'success' | 'duplicate' | 'invalid'
type ToastKind = 'success' | 'duplicate' | 'invalid'

export function QrScanner() {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const runningRef = React.useRef(true)
  const lastTokenRef = React.useRef<{ token: string; at: number } | null>(null)
  const resultRef = React.useRef<ValidateResponse | null>(null)
  const cameraStartingRef = React.useRef(false)
  const toastTimersRef = React.useRef<{ out?: number; clear?: number; scanReset?: number } | null>(null)

  const [cameraState, setCameraState] = React.useState<CameraState>('loading')
  const [cameraError, setCameraError] = React.useState<CameraError | null>(null)
  const [result, setResult] = React.useState<ValidateResponse | null>(null)
  const [scanResult, setScanResult] = React.useState<ScanResult>('idle')
  const [processing, setProcessing] = React.useState(false)
  const [toast, setToast] = React.useState<
    | null
    | {
        kind: ToastKind
        title: string
        subtitle?: string
      }
  >(null)
  const [toastLeaving, setToastLeaving] = React.useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  function playTone(type: 'success' | 'failure') {
    try {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'success') {
        oscillator.frequency.setValueAtTime(1046, ctx.currentTime) // C6
        oscillator.frequency.setValueAtTime(1318, ctx.currentTime + 0.08) // E6
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
      } else {
        oscillator.frequency.setValueAtTime(300, ctx.currentTime)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.4)
      }

      oscillator.onended = () => {
        void ctx.close().catch(() => null)
      }
    } catch {
      // Audio not available — silent fail
    }
  }

  React.useEffect(() => {
    resultRef.current = result
  }, [result])

  React.useEffect(() => {
    runningRef.current = true

    async function startCamera() {
      try {
        if (cameraStartingRef.current) return
        cameraStartingRef.current = true

        setCameraError(null)
        setCameraState('loading')

        const stream = await getCamera()
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setCameraState('active')

        function scanLoop() {
          if (!runningRef.current) return

          if (resultRef.current || processing) {
            rafRef.current = requestAnimationFrame(scanLoop)
            return
          }

          const video = videoRef.current
          const canvas = canvasRef.current

          if (!video || !canvas) {
            rafRef.current = requestAnimationFrame(scanLoop)
            return
          }

          if (video.readyState < 2) {
            rafRef.current = requestAnimationFrame(scanLoop)
            return
          }

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            rafRef.current = requestAnimationFrame(scanLoop)
            return
          }

          const w = video.videoWidth || 0
          const h = video.videoHeight || 0
          if (w === 0 || h === 0) {
            rafRef.current = requestAnimationFrame(scanLoop)
            return
          }

          canvas.width = w
          canvas.height = h
          ctx.drawImage(video, 0, 0, w, h)

          const imageData = ctx.getImageData(0, 0, w, h)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code?.data) {
            const now = Date.now()
            const last = lastTokenRef.current
            if (last && last.token === code.data && now - last.at < 2000) {
              rafRef.current = requestAnimationFrame(scanLoop)
              return
            }
            lastTokenRef.current = { token: code.data, at: now }
            void (async () => {
              setProcessing(true)
              const r = await validateToken(code.data)
              setResult(r)
              setToastLeaving(false)

              if (toastTimersRef.current?.out) window.clearTimeout(toastTimersRef.current.out)
              if (toastTimersRef.current?.clear) window.clearTimeout(toastTimersRef.current.clear)
              if (toastTimersRef.current?.scanReset) window.clearTimeout(toastTimersRef.current.scanReset)

              const sr: ScanResult =
                r.result === 'SUCCESS' ? 'success' : r.result === 'DUPLICATE' ? 'duplicate' : 'invalid'
              setScanResult(sr)

              if (!prefersReducedMotion) {
                playTone(sr === 'success' ? 'success' : 'failure')
                if (navigator.vibrate) {
                  navigator.vibrate(sr === 'success' ? [60] : [40, 30, 40])
                }
              }

              if (r.result === 'SUCCESS') {
                const name = 'guest' in r ? r.guest.name : 'Guest'
                const time = 'checkedInAt' in r && r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString() : ''
                setToast({
                  kind: 'success',
                  title: name,
                  subtitle: time ? `Checked in · ${time}` : 'Checked in',
                })
              } else if (r.result === 'DUPLICATE') {
                const time = 'checkedInAt' in r && r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString() : ''
                setToast({
                  kind: 'duplicate',
                  title: 'Already checked in',
                  subtitle: time ? `Original check-in · ${time}` : undefined,
                })
              } else {
                setToast({ kind: 'invalid', title: 'Invalid pass' })
              }

              toastTimersRef.current = {
                scanReset: window.setTimeout(() => setScanResult('idle'), 800),
                out: window.setTimeout(() => {
                  if (!prefersReducedMotion) setToastLeaving(true)
                }, 1800),
                clear: window.setTimeout(() => {
                  setToast(null)
                  setToastLeaving(false)
                  setResult(null)
                }, 2000),
              }

              setProcessing(false)
            })()
          }

          rafRef.current = requestAnimationFrame(scanLoop)
        }

        rafRef.current = requestAnimationFrame(scanLoop)

      } catch (err: unknown) {
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            setCameraState('permission-denied')
          } else if (err.name === 'NotFoundError') {
            setCameraState('unavailable')
          } else if (err.name === 'NotReadableError') {
            setCameraState('unavailable')
          } else {
            setCameraState('unavailable')
          }
        } else {
          setCameraState('unavailable')
        }

        console.error('Camera error:', err)

        const e = err as { name?: string }
        if (e.name === 'NotAllowedError') {
          setCameraError({ type: 'NOT_ALLOWED', message: 'Camera access was denied. Enable it in your browser settings.' })
        } else if (e.name === 'NotFoundError') {
          setCameraError({ type: 'NOT_FOUND', message: 'No camera was found on this device. Use manual check-in instead.' })
        } else if (e.name === 'NotReadableError') {
          setCameraError({ type: 'NOT_READABLE', message: 'Camera is in use by another app. Close it and try again.' })
        } else {
          setCameraError({ type: 'UNKNOWN', message: 'Unable to access camera. Use manual check-in instead.' })
        }
      } finally {
        cameraStartingRef.current = false
      }
    }

    void startCamera()

    return () => {
      runningRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      cameraStartingRef.current = false
      if (toastTimersRef.current?.out) window.clearTimeout(toastTimersRef.current.out)
      if (toastTimersRef.current?.clear) window.clearTimeout(toastTimersRef.current.clear)
      if (toastTimersRef.current?.scanReset) window.clearTimeout(toastTimersRef.current.scanReset)
    }
  }, [])

  return (
    <Card title="Scanner">
      <style>{`
        @keyframes sweep { from { transform: translateY(0); opacity: 0.2; } to { transform: translateY(100%); opacity: 0.2; } }
        @keyframes toastIn { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .md-sweep { animation: none !important; } }
        @media (prefers-reduced-motion: reduce) { .md-anim { animation: none !important; transition: none !important; } }

        .corner { border-color: var(--md-accent); }
        .corner.success { border-color: var(--md-success); box-shadow: 0 0 12px var(--md-success); transition: all 150ms ease; }
        .corner.invalid { border-color: var(--md-error); box-shadow: 0 0 12px var(--md-error); transition: all 150ms ease; }
      `}</style>
      <div className="space-y-4">
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: 16, border: '1px solid var(--md-border)' }}>
          {toast ? (
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              <div
                className={prefersReducedMotion ? undefined : `md-anim`}
                style={{
                  width: 'min(360px, calc(100% - 24px))',
                  height: 72,
                  borderRadius: 14,
                  background: 'var(--md-card)',
                  border: '1px solid var(--md-border)',
                  borderLeft:
                    toast.kind === 'success'
                      ? '4px solid var(--md-success)'
                      : toast.kind === 'duplicate'
                        ? '4px solid var(--md-warning)'
                        : '4px solid var(--md-error)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  animation:
                    prefersReducedMotion
                      ? undefined
                      : toastLeaving
                        ? 'toastOut 180ms ease forwards'
                        : 'toastIn 240ms cubic-bezier(0.2, 0.9, 0.2, 1) both',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--md-font-heading)',
                    fontSize: toast.kind === 'success' ? 22 : 18,
                    lineHeight: 1.1,
                    fontWeight: 300,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {toast.title}
                </div>
                {toast.subtitle ? (
                  <div className="text-xs text-md-text-muted" style={{ marginTop: 4 }}>
                    {toast.subtitle}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{
              display: cameraState === 'active' ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div
            role="img"
            aria-label="QR code scanner viewfinder"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ position: 'relative', width: '70%', aspectRatio: '1 / 1', maxWidth: 320 }}>
              <span
                className={`corner ${
                  scanResult === 'success' ? 'success' : scanResult === 'invalid' || scanResult === 'duplicate' ? 'invalid' : ''
                }`}
                style={cornerBracketStyle('tl')}
              />
              <span
                className={`corner ${
                  scanResult === 'success' ? 'success' : scanResult === 'invalid' || scanResult === 'duplicate' ? 'invalid' : ''
                }`}
                style={cornerBracketStyle('tr')}
              />
              <span
                className={`corner ${
                  scanResult === 'success' ? 'success' : scanResult === 'invalid' || scanResult === 'duplicate' ? 'invalid' : ''
                }`}
                style={cornerBracketStyle('bl')}
              />
              <span
                className={`corner ${
                  scanResult === 'success' ? 'success' : scanResult === 'invalid' || scanResult === 'duplicate' ? 'invalid' : ''
                }`}
                style={cornerBracketStyle('br')}
              />
              <div
                className="md-sweep"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 1,
                  background: 'var(--md-accent)',
                  animation: 'sweep 1.6s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>

        <div
          className={`text-center text-[11px] uppercase tracking-[0.15em] ${
            cameraState === 'active' && !processing ? 'text-[color:var(--md-accent)]' : 'text-md-text-muted'
          }`}
        >
          {cameraState !== 'active'
            ? 'Initialising camera…'
            : processing
              ? 'Verifying…'
              : 'Ready to scan'}
        </div>

        {cameraState === 'loading' && (
          <div className="text-sm text-md-text-muted">Initialising camera…</div>
        )}
        {cameraState === 'permission-denied' && (
          <div className="text-sm text-md-text-muted">
            Camera permission denied. Please enable camera access in your browser settings.
          </div>
        )}
        {cameraState === 'unavailable' && (
          <div className="space-y-1">
            <div className="font-[family-name:var(--md-font-heading)] text-xl font-light">Camera unavailable</div>
            <div className="text-sm text-md-text-muted">
              {cameraError?.message ?? 'Camera unavailable. Please use manual check-in below.'}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

