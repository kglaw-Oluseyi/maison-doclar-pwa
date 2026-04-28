export function DraftEventPage() {
  return (
    <div className="min-h-[100svh] bg-md-background text-md-text-primary">
      <div className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col justify-center px-6 py-12">
        <div className="text-center">
          <div className="font-[family-name:var(--md-font-heading)] text-4xl font-light text-md-accent">Maison Doclar</div>
          <div className="mx-auto mt-5 h-px w-10 bg-md-accent" />
          <div className="mt-6 font-[family-name:var(--md-font-heading)] text-2xl font-light">
            This event is not yet available
          </div>
          <div className="mt-3 text-sm text-md-text-muted">Please check back soon.</div>
        </div>
      </div>
    </div>
  )
}

