'use client'

import * as React from 'react'

type HostContextValue = {
  slug: string
  eventName: string
  hostName: string
}

const HostContext = React.createContext<HostContextValue | null>(null)

export function HostProvider({ value, children }: { value: HostContextValue; children: React.ReactNode }) {
  return <HostContext.Provider value={value}>{children}</HostContext.Provider>
}

export function useHostContext(): HostContextValue {
  const ctx = React.useContext(HostContext)
  if (!ctx) throw new Error('useHostContext must be used within HostProvider')
  return ctx
}

