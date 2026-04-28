export default function EventNotFound() {
  return (
    <div className="min-h-[100svh] bg-md-background text-md-text-primary">
      <div className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col items-center justify-center px-6 py-12 text-center">
        <a
          href="https://maisondoclar.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--md-font-heading)',
            fontSize: '0.875rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--md-accent)',
            textDecoration: 'none',
          }}
        >
          Maison Doclar
        </a>
        <div className="mx-auto mt-5 h-px w-10 bg-md-accent" />
        <div
          className="mt-8 font-[family-name:var(--md-font-heading)] font-light text-md-text-subtle"
          style={{ fontWeight: 300, fontSize: 'clamp(6rem, 20vw, 12rem)' }}
        >
          404
        </div>
        <div className="mt-4 text-sm text-md-text-muted">This event could not be found.</div>
      </div>
    </div>
  )
}

