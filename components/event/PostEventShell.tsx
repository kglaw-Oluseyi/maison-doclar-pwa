import { Card } from '@/components/ui/Card'
import { AccessPassCard } from '@/components/qr/AccessPassCard'
import { FeedbackForm } from './FeedbackForm'

type FeedbackQuestion = { id: string; question: string; type: 'text' | 'rating' }
type FollowUpLink = { label: string; url: string }

type PostEventConfig = {
  thankYouMessage?: string
  thankYouSubtext?: string
  galleryEnabled?: boolean
  galleryImages?: string[]
  feedbackEnabled?: boolean
  feedbackQuestions?: FeedbackQuestion[]
  followUpLinks?: FollowUpLink[]
}

type EventFeatureFlags = { postEventEnabled?: boolean; feedbackFormEnabled?: boolean; walletPassEnabled?: boolean }

export function PostEventShell({
  event,
  guest,
}: {
  event: {
    slug: string
    name: string
    date?: Date
    featureFlags: unknown
    postEventConfig: unknown
  }
  guest: {
    id: string
    name: string
    accessToken: string
    tableNumber?: string | null
    tags?: string[]
    accessCard?: { qrToken: string; releasedAt: Date | null; invalidatedAt: Date | null } | null
  }
}) {
  const flags = (typeof event.featureFlags === 'object' && event.featureFlags && !Array.isArray(event.featureFlags)
    ? (event.featureFlags as EventFeatureFlags)
    : {}) as EventFeatureFlags

  const cfg = (typeof event.postEventConfig === 'object' && event.postEventConfig && !Array.isArray(event.postEventConfig)
    ? (event.postEventConfig as PostEventConfig)
    : {}) as PostEventConfig

  const galleryEnabled = cfg.galleryEnabled === true
  const galleryImages = Array.isArray(cfg.galleryImages) ? cfg.galleryImages.filter((u) => typeof u === 'string') : []
  const feedbackEnabled = cfg.feedbackEnabled === true && flags.feedbackFormEnabled !== false
  const questions = Array.isArray(cfg.feedbackQuestions) ? cfg.feedbackQuestions : []
  const followUpLinks = Array.isArray(cfg.followUpLinks) ? cfg.followUpLinks : []

  return (
    <div className="space-y-6">
      <Card noPadding>
        <div className="p-6 text-center">
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
              display: 'inline-block',
              marginBottom: 12,
            }}
          >
            Maison Doclar
          </a>
          <div className="font-[family-name:var(--md-font-heading)] text-4xl font-light">{event.name}</div>
          <div className="mx-auto mt-5 h-px w-10 bg-md-accent" />
          <div className="mt-6 font-[family-name:var(--md-font-heading)] text-2xl font-light text-md-accent">
            {cfg.thankYouMessage ?? 'Thank you.'}
          </div>
          <div className="mt-3 text-sm text-md-text-muted">{cfg.thankYouSubtext ?? ''}</div>
        </div>
      </Card>

      {galleryEnabled && galleryImages.length ? (
        <Card title="Gallery" noPadding>
          <div className="p-4" style={{ columnCount: 2, columnGap: 12 }}>
            {galleryImages.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="mb-3 w-full rounded-2xl border border-md-border"
                style={{ breakInside: 'avoid' }}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {guest.accessCard && !guest.accessCard.invalidatedAt && event.date ? (
        <AccessPassCard
          guestName={guest.name}
          eventName={event.name}
          eventDate={event.date}
          tableNumber={(guest.tableNumber ?? null) as any}
          tags={Array.isArray(guest.tags) ? guest.tags : []}
          qrToken={guest.accessCard.qrToken}
          releasedAt={guest.accessCard.releasedAt}
          walletPassEnabled={(event.featureFlags as EventFeatureFlags).walletPassEnabled ?? false}
          accessToken={guest.accessToken}
        />
      ) : null}

      {feedbackEnabled && questions.length ? (
        <Card title="Feedback" noPadding>
          <div className="p-5">
            <FeedbackForm questions={questions as any} eventSlug={event.slug} token={guest.accessToken} />
          </div>
        </Card>
      ) : null}

      {followUpLinks.length ? (
        <Card title="Follow-up" noPadding>
          <div className="p-4">
            {followUpLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '16px 24px',
                  background: 'var(--md-surface-elevated)',
                  border: '1px solid var(--md-border)',
                  borderRadius: '12px',
                  color: 'var(--md-text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                }}
              >
                {link.label} →
              </a>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}

