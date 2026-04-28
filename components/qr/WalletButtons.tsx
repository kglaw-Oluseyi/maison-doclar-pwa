'use client'

import * as React from 'react'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function handleWalletNotConfigured(res: Response): Promise<boolean> {
  if (res.status !== 503) return false
  const data = (await res.json().catch(() => null)) as { code?: string; error?: string } | null
  if (data?.code === 'WALLET_NOT_CONFIGURED') return true
  return true
}

export function WalletButtons({ accessToken }: { accessToken: string }) {
  const [message, setMessage] = React.useState<string | null>(null)
  const [loadingApple, setLoadingApple] = React.useState(false)
  const [loadingGoogle, setLoadingGoogle] = React.useState(false)

  async function addApple() {
    setMessage(null)
    setLoadingApple(true)
    try {
      const res = await fetch(`/api/guest/${encodeURIComponent(accessToken)}/wallet/apple`, { cache: 'no-store' })
      if (await handleWalletNotConfigured(res)) {
        setMessage('Wallet passes are not available for this event.')
        return
      }
      if (!res.ok) {
        setMessage('Unable to generate Apple Wallet pass.')
        return
      }
      const blob = await res.blob()
      downloadBlob(blob, 'access-pass.pkpass')
    } catch {
      setMessage('Wallet passes are not available for this event.')
    } finally {
      setLoadingApple(false)
    }
  }

  async function addGoogle() {
    setMessage(null)
    setLoadingGoogle(true)
    try {
      const res = await fetch(`/api/guest/${encodeURIComponent(accessToken)}/wallet/google`, {
        method: 'GET',
        redirect: 'manual',
        cache: 'no-store',
      })
      if (await handleWalletNotConfigured(res)) {
        setMessage('Wallet passes are not available for this event.')
        return
      }
      // If redirect is blocked by fetch, fallback to a direct navigation.
      window.location.href = `/api/guest/${encodeURIComponent(accessToken)}/wallet/google`
    } catch {
      setMessage('Wallet passes are not available for this event.')
    } finally {
      setLoadingGoogle(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
      <button
        type="button"
        onClick={() => void addApple()}
        disabled={loadingApple}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 20px',
          border: '1px solid var(--md-border-muted)',
          borderRadius: 8,
          color: 'var(--md-text-primary)',
          fontSize: '0.8rem',
          background: 'var(--md-surface-elevated)',
          opacity: loadingApple ? 0.7 : 1,
        }}
      >
        {loadingApple ? 'Preparing Apple Wallet…' : 'Add to Apple Wallet'}
      </button>
      <button
        type="button"
        onClick={() => void addGoogle()}
        disabled={loadingGoogle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 20px',
          border: '1px solid var(--md-border-muted)',
          borderRadius: 8,
          color: 'var(--md-text-primary)',
          fontSize: '0.8rem',
          background: 'var(--md-surface-elevated)',
          opacity: loadingGoogle ? 0.7 : 1,
        }}
      >
        {loadingGoogle ? 'Opening Google Wallet…' : 'Add to Google Wallet'}
      </button>
      {message ? <div style={{ fontSize: '0.8rem', color: 'var(--md-text-muted)' }}>{message}</div> : null}
    </div>
  )
}

