import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'

import { HostLoginForm } from '@/components/host/HostLoginForm'

export default async function HostLoginPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const event = await prisma.event.findUnique({ where: { slug }, select: { name: true, slug: true } })
  if (!event) notFound()

  return (
    <div className="min-h-[100svh] bg-md-background text-md-text-primary">
      <div className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col justify-center px-6 py-12">
        <div className="text-center">
          <div className="font-[family-name:var(--md-font-heading)] text-4xl font-light text-md-accent">Maison Doclar</div>
          <div className="mx-auto mt-5 h-px w-10 bg-md-accent" />
          <div className="mt-5 font-[family-name:var(--md-font-heading)] text-2xl font-light">{event.name}</div>
          <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-md-text-muted">Host Access</div>
        </div>

        <div className="mt-10">
          <HostLoginForm slug={event.slug} />
        </div>
      </div>
    </div>
  )
}

