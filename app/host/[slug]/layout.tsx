export default async function HostLayout(props: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-[100svh] bg-md-background text-md-text-primary">
      <div className="mx-auto max-w-[720px] px-5 py-6">{props.children}</div>
    </div>
  )
}

