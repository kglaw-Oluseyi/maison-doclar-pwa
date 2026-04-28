import './globals.css'

import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { cookies } from 'next/headers'

const heading = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-md-heading',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-md-body',
})

export const metadata: Metadata = {
  title: 'Maison Doclar OS',
  description: 'Luxury guest management for private events.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('md-theme')?.value
  const isLight = theme === 'light'

  return (
    <html
      lang="en"
      data-theme={isLight ? 'light' : 'dark'}
      className={[heading.variable, body.variable].join(' ')}
      style={
        {
          ['--md-font-heading' as never]: heading.style.fontFamily,
          ['--md-font-body' as never]: body.style.fontFamily,
        } as React.CSSProperties
      }
    >
      <body>{children}</body>
    </html>
  )
}

