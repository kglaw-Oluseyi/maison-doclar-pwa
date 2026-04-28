import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'md-background': 'rgb(var(--md-background-rgb) / <alpha-value>)',
        'md-surface': 'rgb(var(--md-surface-rgb) / <alpha-value>)',
        'md-surface-elevated': 'rgb(var(--md-surface-elevated-rgb) / <alpha-value>)',
        'md-text-primary': 'rgb(var(--md-text-primary-rgb) / <alpha-value>)',
        'md-text-muted': 'rgb(var(--md-text-muted-rgb) / <alpha-value>)',
        'md-text-subtle': 'rgb(var(--md-text-subtle-rgb) / <alpha-value>)',
        'md-accent': 'rgb(var(--md-accent-rgb) / <alpha-value>)',
        'md-accent-light': 'rgb(var(--md-accent-light-rgb) / <alpha-value>)',
        'md-accent-dark': 'rgb(var(--md-accent-dark-rgb) / <alpha-value>)',
        'md-border': 'rgb(var(--md-border-rgb) / <alpha-value>)',
        'md-border-muted': 'rgb(var(--md-border-muted-rgb) / <alpha-value>)',
        'md-error': 'rgb(var(--md-error-rgb) / <alpha-value>)',
        'md-success': 'rgb(var(--md-success-rgb) / <alpha-value>)',
        'md-warning': 'rgb(var(--md-warning-rgb) / <alpha-value>)'
      },
      fontFamily: {
        heading: ['var(--md-font-heading)'],
        body: ['var(--md-font-body)']
      },
      keyframes: {
        'md-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' }
        }
      },
      animation: {
        'md-fade-in': 'md-fade-in 400ms ease forwards'
      }
    }
  },
  plugins: []
}

export default config

