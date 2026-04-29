'use client'

import React from 'react'

interface TokenPersistProps {
  slug: string
  token: string
}

export function TokenPersist({ slug, token }: TokenPersistProps) {
  React.useEffect(() => {
    try {
      localStorage.setItem(`md-token-${slug}`, token)
    } catch {}
  }, [slug, token])

  return null
}
