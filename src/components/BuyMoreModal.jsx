import { useState } from 'react'
import { motion } from 'framer-motion'

// ─── Coming Soon badge ────────────────────────────────────────────────────────
// Sharp-cornered stamp in accent red, positioned top-right of each pricing card.

function SoonBadge() {
  return (
    <span style={{
      position:       'absolute',
      top:            '-0.6rem',
      right:          '-0.6rem',
      background:     'var(--color-accent)',
      color:          'var(--color-parchment)',
      fontFamily:     'var(--font-sans)',
      fontSize:       '0.42rem',
      fontWeight:     700,
      letterSpacing:  '0.14em',
      textTransform:  'uppercase',
      padding:        '0.2rem 0.45rem',
      zIndex:         1,
      pointerEvents:  'none',
    }}>
      SOON
    </span>
  )
}

// ─── Pricing card ─────────────────────────────────────────────────────────────

function PricingCard({ label, sublabel, price, priceSuffix, description, highlighted = false }) {
  return (
    <div style={{
      border:     `1px solid ${highlighted ? 'var(--color-ink)' : 'rgba(26,26,24,0.2)'}`,
      background: highlighted ? 'var(--color-parchment-dark)' : 'transparent',
      padding:    '1.25rem 1.1rem',
      position:   'relative',
      flex:        1,
    }}>
      <SoonBadge />
      {sublabel && (
        <p style={{
          fontFamily:    'var(--font-sans)',
          fontSize:      '0.55rem',
          fontWeight:    600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color:         highlighted ? 'var(--color-ink-muted)' : 'var(--color-accent)',
          marginBottom:  '0.4rem',
        }}>
          {sublabel}
        </p>
      )}
      <p style={{
        fontFamily:   'var(--font-serif)',
        fontSize:     '1rem',
        fontWeight:   700,
        color:        'var(--color-ink)',
        lineHeight:   1.2,
        marginBottom: '0.35rem',
      }}>
        {label}
      </p>
      {description && (
        <p style={{
          fontFamily:   'var(--font-garamond)',
          fontSize:     '0.78rem',
          fontStyle:    'italic',
          color:        'var(--color-ink-muted)',
          marginBottom: '0.75rem',
        }}>
          {description}
        </p>
      )}
      <p style={{
        fontFamily:  'var(--font-serif)',
        fontSize:    '1.5rem',
        fontWeight:  900,
        color:       'var(--color-ink)',
        lineHeight:  1,
      }}>
        {price}
        {priceSuffix && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize:   '0.65rem',
            fontWeight: 400,
            color:      'var(--color-ink-muted)',
          }}>
            {priceSuffix}
          </span>
        )}
      </p>
    </div>
  )
}

// ─── Section divider ─────────────────────────────────────────────────────────

function SectionRule() {
  return <div style={{ borderTop: '1px solid rgba(26,26,24,0.1)', margin: '1.75rem 0' }} />
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily:    'var(--font-sans)',
      fontSize:      '0.58rem',
      fontWeight:    600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color:         'var(--color-accent)',
      marginBottom:  '1rem',
    }}>
      {children}
    </p>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BuyMoreModal({ onClose, activateTopUp, activateSubscription, redeemBurnerCode }) {
  const [code, setCode]           = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeSuccess, setCodeSuccess] = useState(false)
  const [redeeming, setRedeeming] = useState(false)

  async function handleRedeem(e) {
    e.preventDefault()
    if (!code.trim()) return
    setCodeError('')
    setRedeeming(true)
    const result = await redeemBurnerCode(code.trim())
    setRedeeming(false)
    if (result.success) {
      setCodeSuccess(true)
    } else {
      setCodeError(result.error)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(26,26,24,0.6)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          200,
        padding:         '1.5rem',
        overflowY:       'auto',
      }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-parchment)',
          border:     '1px solid var(--color-ink)',
          padding:    '2.25rem',
          maxWidth:   '540px',
          width:      '100%',
          position:   'relative',
        }}>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position:   'absolute',
            top:        '1rem',
            right:      '1.25rem',
            background: 'none',
            border:     'none',
            fontFamily: 'var(--font-sans)',
            fontSize:   '0.75rem',
            color:      'var(--color-ink-muted)',
            cursor:     'pointer',
            padding:    0,
          }}>
          ✕
        </button>

        {/* ── Section 1: Top Up ──────────────────────────────────────────────── */}
        <SectionLabel>Talk and top up.</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <PricingCard
            label="The Snack"
            description="50 prompts, carried over"
            price="£5"
          />
          <PricingCard
            label="The Pack"
            description="100 prompts, carried over"
            price="£10"
          />
        </div>

        <SectionRule />

        {/* ── Section 2: Subscribe ────────────────────────────────────────────── */}
        <SectionLabel>Subscribe and never have to worry.</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <PricingCard
            sublabel="Tier 1"
            label={<>Probably Never<br />Run Out</>}
            description="Monthly subscription"
            price="£9.99"
            priceSuffix=" /mo"
          />
          <PricingCard
            sublabel="Tier 2"
            label={<>Definitely Never<br />Run Out</>}
            description="Monthly subscription"
            price="£29.99"
            priceSuffix=" /mo"
            highlighted
          />
        </div>

        <SectionRule />

        {/* ── Section 3: Code Redemption ──────────────────────────────────────── */}
        <SectionLabel>Have a code?</SectionLabel>

        {codeSuccess ? (
          <div style={{
            border:     '1px solid rgba(26,26,24,0.15)',
            padding:    '1rem 1.25rem',
            background: 'var(--color-parchment-dark)',
          }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize:   '1rem',
              fontWeight: 700,
              color:      'var(--color-ink)',
              marginBottom: '0.2rem',
            }}>
              Partner access activated.
            </p>
            <p style={{
              fontFamily: 'var(--font-garamond)',
              fontSize:   '0.88rem',
              fontStyle:  'italic',
              color:      'var(--color-ink-muted)',
            }}>
              Welcome aboard. Your 10,000 prompts are ready.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleRedeem}
            style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                className="press-input"
                type="text"
                placeholder="Enter your code"
                value={code}
                onChange={e => { setCode(e.target.value); setCodeError('') }}
                style={{ width: '100%' }}
                autoComplete="off"
                autoCapitalize="off"
              />
              {codeError && (
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize:   '0.65rem',
                  color:      'var(--color-accent)',
                  marginTop:  '0.35rem',
                }}>
                  {codeError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="ink-stamp"
              disabled={!code.trim() || redeeming}
              style={{
                fontSize:  '0.65rem',
                padding:   '0.4rem 1rem',
                opacity:   (!code.trim() || redeeming) ? 0.5 : 1,
                cursor:    (!code.trim() || redeeming) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
              {redeeming ? 'Checking...' : 'Redeem'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
