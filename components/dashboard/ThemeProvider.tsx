'use client'

import * as React from 'react'

export type Theme = 'dark' | 'light'

export const ThemeContext = React.createContext<{
  theme: Theme
  toggle: () => void
}>({
  theme: 'dark',
  toggle: () => {},
})

export function useTheme() {
  return React.useContext(ThemeContext)
}

export type ThemeProviderProps = {
  initialTheme: Theme
  children: React.ReactNode
}

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(initialTheme)

  const toggle = React.useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.cookie = `md-theme=${theme};path=/;max-age=31536000;SameSite=Strict`
  }, [theme])

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

