import { useState } from 'react'

/**
 * Sticky bottom bar — referral messaging + "Buy More Prompts" CTA.
 *
 * The BuyMoreModal is now owned by the parent tool UI (where useCredits lives),
 * so this component just calls onBuyMore to open it.
 */
export default function ActionFooter({ addCredits, user, onBuyMore }) {
  const [simulatingReferral, setSimulatingReferral] = useState(false)
  const [referralDone, setReferralDone]             = useState(false)
  const [copied, setCopied]                         = useState(false)

  const referralCode = user?.email ? btoa(user.email) : 'unknown'
  const referralLink = `${window.location.origin}?ref=${referralCode}`

  function copyReferralLink() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSimulateReferral() {
    setSimulatingReferral(true)

    // Credits awarded to the current user (newly referred person)
    await addCredits(100, 'referral_bonus')

    // ── Future backend: also credit the referrer ──────────────────────────────
    // const referrerId = localStorage.getItem('pp_referrer')
    // if (referrerId) {
    //   await fetch('/api/referrals/complete', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${localStorage.getItem('pp_session')}`,
    //     },
    //     body: JSON.stringify({ referrerId, bonusAmount: 100, reason: 'referral_bonus' }),
    //   })
    // }
    // ─────────────────────────────────────────────────────────────────────────

    setSimulatingReferral(false)
    setReferralDone(true)
  }

  return (
    <div style={{
      position:       'fixed',
      bottom:         0,
      left:           0,
      right:          0,
      background:     'var(--color-parchment)',
      borderTop:      '1px solid rgba(26,26,24,0.2)',
      padding:        '0.6rem 2rem',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      zIndex:         50,
    }}>

      {/* Left: referral messaging */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{
          fontFamily: 'var(--font-garamond)',
          fontSize:   '0.88rem',
          fontStyle:  'italic',
          color:      'var(--color-ink-muted)',
        }}>
          Refer a friend and get 100 free prompts each
        </span>

        <button
          className="ink-stamp"
          onClick={copyReferralLink}
          style={{ fontSize: '0.6rem', padding: '0.25rem 0.65rem' }}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <button
          onClick={handleSimulateReferral}
          disabled={simulatingReferral || referralDone}
          style={{
            background:    'none',
            border:        'none',
            fontFamily:    'var(--font-sans)',
            fontSize:      '0.58rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         referralDone ? 'var(--color-ink-muted)' : 'var(--color-accent)',
            cursor:        (simulatingReferral || referralDone) ? 'default' : 'pointer',
            padding:       0,
            opacity:       (simulatingReferral || referralDone) ? 0.65 : 1,
            transition:    'opacity 0.15s',
          }}>
          {simulatingReferral ? 'Processing...' : referralDone ? '✓ Bonus Applied' : 'Simulate Referral'}
        </button>
      </div>

      {/* Right: Buy More CTA */}
      <button
        className="wax-seal"
        onClick={onBuyMore}
        style={{ fontSize: '0.72rem', padding: '0.4rem 1.1rem' }}>
        Buy More Prompts
      </button>
    </div>
  )
}
