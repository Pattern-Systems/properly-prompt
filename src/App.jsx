import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AuthGate from './components/AuthGate'
import IndividualToolUI from './components/IndividualToolUI'
import BusinessToolUI from './components/BusinessToolUI'
import HighDemandPage from './components/HighDemandPage'
import TypewriterHero from './components/TypewriterHero'
import PricingPage from './components/PricingPage'
import { getMe, clearSession } from './api'
import './index.css'

// 8 main models — matches the "8+" stat
const CAROUSEL_MODELS = [
  'Claude 3.5',
  'GPT-4o',
  'Gemini 1.5 Pro',
  'Sora',
  'Qwen3',
  'Mistral Large',
  'Midjourney',
  'DALL-E 3',
]

const STATS = [
  { value: '10', label: 'Free prompts, daily' },
  { value: '8+', label: 'AI models supported' },
  { value: '∞', label: 'Potential ROI' },
]

export default function App() {
  const [page, setPage] = useState('home')  // 'home' | 'signup' | 'login' | 'pricing'
  const [user, setUser] = useState(null)    // { name, email, tier }
  const [overLimit, setOverLimit] = useState(false)

  // Auto-restore session from localStorage JWT on mount
  useEffect(() => {
    getMe().then(u => { if (u) setUser(u) })
  }, [])

  // ReferralManager — capture ?ref=ID from URL on first visit
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      localStorage.setItem('pp_referrer', ref)
    }
  }, [])

  function handleOverLimit() {
    setOverLimit(true)
  }

  function handleLogout() {
    clearSession()
    setUser(null)
    setPage('home')
  }

  // Global kill switch — overrides all other views
  if (overLimit) {
    return <HighDemandPage />
  }

  if (user) {
    const ToolUI = user.tier === 'Business' ? BusinessToolUI : IndividualToolUI
    return (
      <motion.div key="tool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
        <ToolUI user={user} onOverLimit={handleOverLimit} onLogout={handleLogout} />
      </motion.div>
    )
  }

  if (page === 'pricing') {
    return (
      <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <PricingPage onBack={() => setPage('home')} onGetStarted={() => setPage('signup')} />
      </motion.div>
    )
  }

  if (page === 'signup') {
    return (
      <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <AuthGate mode="signup" onAuth={setUser} onBack={() => setPage('home')} />
      </motion.div>
    )
  }

  if (page === 'login') {
    return (
      <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <AuthGate mode="login" onAuth={setUser} onBack={() => setPage('home')} />
      </motion.div>
    )
  }

  return (
    <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <LandingPage onGetStarted={() => setPage('signup')} onLogin={() => setPage('login')} onPricing={() => setPage('pricing')} />
    </motion.div>
  )
}

function LandingPage({ onGetStarted, onLogin, onPricing }) {
  const carouselItems = [...CAROUSEL_MODELS, ...CAROUSEL_MODELS]

  return (
    <div style={{
      background: 'var(--color-parchment-dark)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 3rem',
        borderBottom: '1px solid rgba(26,26,24,0.12)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem',
          fontWeight: 900,
          color: 'var(--color-ink)',
          margin: 0,
          letterSpacing: '-0.01em',
        }}>
          Properly Prompt
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onPricing}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: 'var(--color-ink-muted)',
              cursor: 'pointer',
              padding: '0.4rem 0.75rem',
              letterSpacing: '0.01em',
            }}>
            Pricing
          </button>
          <button
            onClick={onLogin}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: 'var(--color-ink-muted)',
              cursor: 'pointer',
              padding: '0.4rem 0.75rem',
              letterSpacing: '0.01em',
            }}>
            Log in
          </button>
          <button
            onClick={onGetStarted}
            style={{
              background: 'transparent',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-serif)',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1px solid rgba(26,26,24,0.3)',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}>
            Get started — free
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5rem 2rem 3rem',
      }}>

        {/* Eyebrow */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--color-ink-muted)',
          marginBottom: '1.25rem',
        }}>
          The Prompt Engineer's Tool
        </p>

        {/* Headline */}
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: 'var(--color-ink)',
          textAlign: 'center',
          margin: '0 0 0.6rem',
          maxWidth: '640px',
        }}>
          Stop asking AI.<br />Start commanding it.
        </h2>

        <p style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '1.1rem',
          fontStyle: 'italic',
          color: 'var(--color-ink-muted)',
          marginBottom: '3.5rem',
          textAlign: 'center',
        }}>
          The difference between AI failure and ROI is the prompt.
        </p>

        {/* ── Typewriter hero ── */}
        <div style={{ width: '60%', maxWidth: '860px', minWidth: '320px', marginBottom: '1.5rem' }}>
          <TypewriterHero />
        </div>

        {/* ── Model carousel ── */}
        <div style={{
          width: '60%',
          maxWidth: '860px',
          minWidth: '320px',
          borderTop: '1px solid rgba(26,26,24,0.1)',
          borderBottom: '1px solid rgba(26,26,24,0.1)',
          padding: '0.7rem 0',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '48px',
            background: 'linear-gradient(to right, var(--color-parchment-dark), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '48px',
            background: 'linear-gradient(to left, var(--color-parchment-dark), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />
          <div className="carousel-track">
            {carouselItems.map((model, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                paddingRight: '2rem',
                whiteSpace: 'nowrap',
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink-muted)',
                }}>
                  {model}
                </span>
                <span style={{
                  display: 'inline-block',
                  width: 3,
                  height: 3,
                  background: 'var(--color-rule)',
                  flexShrink: 0,
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{
          display: 'flex',
          gap: '0',
          border: '1px solid rgba(26,26,24,0.15)',
          marginBottom: '2.5rem',
        }}>
          {STATS.map(({ value, label }, i) => (
            <div key={value} style={{
              padding: '1.25rem 3rem',
              textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(26,26,24,0.15)' : 'none',
            }}>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.25rem',
                fontWeight: 900,
                color: 'var(--color-ink)',
                lineHeight: 1,
                marginBottom: '0.3rem',
              }}>
                {value}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-ink-muted)',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <p style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.95rem',
          fontStyle: 'italic',
          color: 'var(--color-ink-muted)',
          marginBottom: '1rem',
          textAlign: 'center',
        }}>
          Get 10 free prompts daily — no credit card required.
        </p>

        <button
          onClick={onGetStarted}
          style={{
            background: 'var(--color-ink)',
            color: 'var(--color-parchment-dark)',
            fontFamily: 'var(--font-serif)',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            padding: '0.65rem 1.75rem',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            marginBottom: '4rem',
          }}>
          Login / Sign up
        </button>

      </main>

      {/* ── Footer ── */}
      <footer style={{
        padding: '1rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(26,26,24,0.1)',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          color: 'var(--color-ink-muted)',
        }}>
          © {new Date().getFullYear()} Properly Prompt
        </span>
        <span style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.8rem',
          fontStyle: 'italic',
          color: 'var(--color-ink-muted)',
        }}>
          properlyprompt.ai
        </span>
      </footer>
    </div>
  )
}
