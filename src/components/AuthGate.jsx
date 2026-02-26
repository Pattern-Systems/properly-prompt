import { useState } from 'react'
import { signup, login, triggerGHLWebhook } from '../api'

export default function AuthGate({ mode = 'signup', onAuth, onBack }) {
  const [localMode, setLocalMode] = useState(mode)
  const [tier, setTier] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function switchMode(m) {
    setLocalMode(m)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      let user
      if (localMode === 'signup') {
        user = await signup({ name, email, password, tier })
        triggerGHLWebhook(name, email, tier) // non-blocking CRM
      } else {
        user = await login({ email, password })
      }
      onAuth(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSignup = localMode === 'signup'
  const canSubmit = isSignup
    ? (tier && email && password && !isSubmitting)
    : (email && password && !isSubmitting)

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
          {isSignup ? 'Get started.' : 'Welcome back.'}
        </h2>
        <p style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.95rem',
          fontStyle: 'italic',
          color: 'var(--color-ink-muted)',
          marginBottom: '2rem',
        }}>
          {isSignup ? '10 free prompts, every day.' : 'Log in to your account.'}
        </p>

        {/* Tier selection — signup only */}
        {isSignup && (
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
        )}

        {/* Full Name — signup only */}
        {isSignup && (
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
        )}

        {/* Email */}
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

        {/* Password */}
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
            Password
          </label>
          <input
            className="press-input"
            type="password"
            placeholder={isSignup ? 'Min. 8 characters' : 'Your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Error message */}
        {error && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            color: 'var(--color-accent)',
            marginBottom: '1rem',
            lineHeight: 1.4,
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: '100%',
            background: 'var(--color-ink)',
            color: 'var(--color-parchment-dark)',
            fontFamily: 'var(--font-serif)',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            padding: '0.75rem 1.5rem',
            cursor: !canSubmit ? 'not-allowed' : 'pointer',
            letterSpacing: '0.01em',
            opacity: !canSubmit ? 0.55 : 1,
            transition: 'opacity 0.15s',
          }}>
          {isSubmitting
            ? (isSignup ? 'Creating account...' : 'Logging in...')
            : (isSignup ? 'Create Account' : 'Log In')}
        </button>

        {isSignup && !tier && (
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

        {/* Mode switch */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.72rem',
          color: 'var(--color-ink-muted)',
          textAlign: 'center',
          marginTop: '1.5rem',
        }}>
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? 'login' : 'signup')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              color: 'var(--color-ink)',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </form>
    </div>
  )
}
