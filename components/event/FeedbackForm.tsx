'use client'

import React from 'react'

interface FeedbackQuestion {
  id: string
  question: string
  type: 'text' | 'rating'
}

interface FeedbackFormProps {
  questions: FeedbackQuestion[]
  eventSlug: string
  token: string
}

export function FeedbackForm({ questions, eventSlug, token }: FeedbackFormProps) {
  const [responses, setResponses] = React.useState<Record<string, string | number>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  function validateResponses(): Record<string, string> {
    const errs: Record<string, string> = {}
    questions.forEach((q) => {
      if (q.type === 'rating' && !responses[q.id]) {
        errs[q.id] = 'Please select a rating'
      }
    })
    return errs
  }

  async function handleSubmit() {
    const errs = validateResponses()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventSlug}/feedback?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: Object.entries(responses).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' })
      }
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '32px 24px',
          background: 'var(--md-surface)',
          border: '1px solid var(--md-border)',
          borderRadius: '16px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--md-font-heading)',
            fontSize: '1.5rem',
            color: 'var(--md-text-primary)',
            marginBottom: '8px',
          }}
        >
          Thank you
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--md-text-muted)' }}>Your response has been received.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {questions.map((q) => (
        <div key={q.id}>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--md-text-primary)',
              marginBottom: '12px',
            }}
          >
            {q.question}
          </p>

          {q.type === 'rating' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setResponses((prev) => ({ ...prev, [q.id]: n }))
                    setErrors((prev) => ({ ...prev, [q.id]: '' }))
                  }}
                  style={{
                    width: '44px',
                    height: '44px',
                    border: responses[q.id] === n ? '1px solid var(--md-accent)' : '1px solid var(--md-border)',
                    background: responses[q.id] === n ? 'rgba(183, 159, 133, 0.15)' : 'transparent',
                    color: responses[q.id] === n ? 'var(--md-accent)' : 'var(--md-text-muted)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {q.type === 'text' && (
            <textarea
              value={(responses[q.id] as string) ?? ''}
              onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                background: 'var(--md-surface)',
                border: '1px solid var(--md-border)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--md-text-primary)',
                fontFamily: 'var(--md-font-body)',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          )}

          {errors[q.id] ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--md-error)', marginTop: '4px' }}>{errors[q.id]}</p>
          ) : null}
        </div>
      ))}

      {errors.form ? <p style={{ fontSize: '0.75rem', color: 'var(--md-error)' }}>{errors.form}</p> : null}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '14px',
          border: '1px solid var(--md-accent)',
          background: 'transparent',
          color: 'var(--md-text-primary)',
          fontFamily: 'var(--md-font-body)',
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </div>
  )
}

