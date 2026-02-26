import { useState } from 'react'
import { triggerGHLWebhook } from '../api'

export default function AuthGate({ onAuth, onBack }) {
  const [tier, setTier] = useState(null) // 'Individual' | 'Business'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !tier) return
    setIsSubmitting(true)
    // Fire GHL webhook (non-blocking)
    await triggerGHLWebhook(name, email, tier)
    onAuth({ name, email, tier })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-parchment-dark)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>

      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '2rem',
          background: 'none',
          border: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          color: 'var(--color-ink-muted)',
          cursor: 'pointer',
          padding: 0,
          textTransform: 'uppercase',
        }}>
        ← Back
      </button>

      {/* Wordmark */}
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1rem',
        fontWeight: 900,
        color: 'var(--color-ink)',
        marginBottom: '3rem',
        letterSpacing: '-0.01em',
      }}>
        Properly Prompt
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', maxWidth: '400px' }}>

        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--color-ink)',
          marginBottom: '0.4rem',
          lineHeight: 1.1,
        }}>
          Get started.
        </h2>
        <p style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.95rem',
          fontStyle: 'italic',
          color: 'var(--color-ink-muted)',
          marginBottom: '2rem',
        }}>
          10 free prompts, every day.
        </p>

        {/* Tier selection */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-muted)',
            marginBottom: '0.75rem',
          }}>
            Select Your Plan
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {/* Individual */}
            <button
              type="button"
              onClick={() => setTier('Individual')}
              style={{
                border: `2px solid ${tier === 'Individual' ? 'var(--color-accent)' : 'rgba(26,26,24,0.18)'}`,
                padding: '1.1rem 0.9rem',
                background: tier === 'Individual' ? 'rgba(139,0,0,0.04)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: tier === 'Individual' ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                marginBottom: '0.25rem',
                transition: 'color 0.15s',
              }}>
                Individual
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-ink)',
                marginBottom: '0.2rem',
              }}>
                Personal Use
              </div>
              <div style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.78rem',
                fontStyle: 'italic',
                color: 'var(--color-ink-muted)',
              }}>
                Creators & freelancers
              </div>
            </button>

            {/* Business */}
            <button
              type="button"
              onClick={() => setTier('Business')}
              style={{
                border: `2px solid ${tier === 'Business' ? 'var(--color-ink)' : 'rgba(26,26,24,0.18)'}`,
                padding: '1.1rem 0.9rem',
                background: tier === 'Business' ? 'rgba(26,26,24,0.04)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: tier === 'Business' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                marginBottom: '0.25rem',
                transition: 'color 0.15s',
              }}>
                Business
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-ink)',
                marginBottom: '0.2rem',
              }}>
                Enterprise Use
              </div>
              <div style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.78rem',
                fontStyle: 'italic',
                color: 'var(--color-ink-muted)',
              }}>
                Teams & agencies
              </div>
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-muted)',
            marginBottom: '0.5rem',
          }}>
            Full Name
          </label>
          <input
            className="press-input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '2.25rem' }}>
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-muted)',
            marginBottom: '0.5rem',
          }}>
            Email Address
          </label>
          <input
            className="press-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!tier || !email || isSubmitting}
          style={{
            width: '100%',
            background: 'var(--color-ink)',
            color: 'var(--color-parchment-dark)',
            fontFamily: 'var(--font-serif)',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            padding: '0.75rem 1.5rem',
            cursor: (!tier || !email || isSubmitting) ? 'not-allowed' : 'pointer',
            letterSpacing: '0.01em',
            opacity: (!tier || !email || isSubmitting) ? 0.55 : 1,
            transition: 'opacity 0.15s',
          }}>
          {isSubmitting ? 'Setting up...' : 'Continue'}
        </button>

        {!tier && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.65rem',
            color: 'var(--color-ink-muted)',
            textAlign: 'center',
            marginTop: '0.75rem',
          }}>
            Select a plan above to continue
          </p>
        )}
      </form>
    </div>
  )
}
