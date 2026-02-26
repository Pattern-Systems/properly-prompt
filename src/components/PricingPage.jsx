// ─── Coming Soon badge (same as BuyMoreModal) ────────────────────────────────

function SoonBadge() {
  return (
    <span style={{
      position:      'absolute',
      top:           '-0.6rem',
      right:         '-0.6rem',
      background:    'var(--color-accent)',
      color:         'var(--color-parchment)',
      fontFamily:    'var(--font-sans)',
      fontSize:      '0.42rem',
      fontWeight:    700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      padding:       '0.2rem 0.45rem',
      zIndex:        1,
      pointerEvents: 'none',
    }}>
      SOON
    </span>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ name, price, priceSuffix, description, cta, onCta, soon = false, highlighted = false }) {
  return (
    <div style={{
      border:     `1px solid ${highlighted ? 'var(--color-ink)' : 'rgba(26,26,24,0.18)'}`,
      background: highlighted ? 'var(--color-parchment-dark)' : 'transparent',
      padding:    '1.75rem 1.5rem',
      position:   'relative',
      display:    'flex',
      flexDirection: 'column',
    }}>
      {soon && <SoonBadge />}

      <p style={{
        fontFamily:   'var(--font-serif)',
        fontSize:     '1rem',
        fontWeight:   700,
        color:        'var(--color-ink)',
        lineHeight:   1.2,
        marginBottom: '0.5rem',
      }}>
        {name}
      </p>

      {description && (
        <p style={{
          fontFamily:   'var(--font-garamond)',
          fontSize:     '0.82rem',
          fontStyle:    'italic',
          color:        'var(--color-ink-muted)',
          marginBottom: '1rem',
          lineHeight:   1.5,
          flex:         1,
        }}>
          {description}
        </p>
      )}

      <p style={{
        fontFamily:   'var(--font-serif)',
        fontSize:     '1.6rem',
        fontWeight:   900,
        color:        'var(--color-ink)',
        lineHeight:   1,
        marginBottom: '1.25rem',
      }}>
        {price}
        {priceSuffix && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize:   '0.7rem',
            fontWeight: 400,
            color:      'var(--color-ink-muted)',
          }}>
            {priceSuffix}
          </span>
        )}
      </p>

      <button
        onClick={onCta}
        disabled={soon}
        style={{
          background:    soon ? 'transparent' : 'var(--color-ink)',
          color:         soon ? 'var(--color-ink-muted)' : 'var(--color-parchment)',
          border:        `1px solid ${soon ? 'rgba(26,26,24,0.2)' : 'var(--color-ink)'}`,
          fontFamily:    'var(--font-sans)',
          fontSize:      '0.7rem',
          fontWeight:    600,
          letterSpacing: '0.06em',
          padding:       '0.5rem 1rem',
          cursor:        soon ? 'not-allowed' : 'pointer',
          transition:    'opacity 0.15s',
        }}>
        {cta}
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PricingPage({ onBack, onGetStarted }) {
  return (
    <div style={{
      minHeight:      '100vh',
      background:     'var(--color-parchment-dark)',
      display:        'flex',
      flexDirection:  'column',
    }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          position:      'absolute',
          top:           '1.5rem',
          left:          '2rem',
          background:    'none',
          border:        'none',
          fontFamily:    'var(--font-sans)',
          fontSize:      '0.75rem',
          letterSpacing: '0.08em',
          color:         'var(--color-ink-muted)',
          cursor:        'pointer',
          padding:       0,
          textTransform: 'uppercase',
        }}>
        ← Back
      </button>

      <main style={{
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        padding:       '5rem 2rem 4rem',
        maxWidth:      '860px',
        margin:        '0 auto',
        width:         '100%',
      }}>

        {/* Wordmark */}
        <p style={{
          fontFamily:    'var(--font-serif)',
          fontSize:      '1rem',
          fontWeight:    900,
          color:         'var(--color-ink)',
          marginBottom:  '3rem',
          letterSpacing: '-0.01em',
        }}>
          Properly Prompt
        </p>

        {/* Heading */}
        <h1 style={{
          fontFamily:    'var(--font-serif)',
          fontSize:      'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight:    900,
          color:         'var(--color-ink)',
          lineHeight:    1.1,
          letterSpacing: '-0.02em',
          textAlign:     'center',
          marginBottom:  '0.75rem',
        }}>
          Simple pricing.
        </h1>
        <p style={{
          fontFamily:   'var(--font-garamond)',
          fontSize:     '1.1rem',
          fontStyle:    'italic',
          color:        'var(--color-ink-muted)',
          textAlign:    'center',
          marginBottom: '3.5rem',
        }}>
          Start free. Upgrade when you're ready.
        </p>

        {/* Plan grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap:                 '1rem',
          width:               '100%',
          marginBottom:        '2rem',
        }}>
          <PlanCard
            name="Free"
            price="£0"
            description="10 prompts every day, no credit card required. Resets at midnight."
            cta="Get started — free"
            onCta={onGetStarted}
            soon={false}
          />
          <PlanCard
            name="Probably Never Run Out"
            price="£4.99"
            priceSuffix=" /mo"
            description="A generous monthly allowance. You'll almost certainly never see a limit."
            cta="Coming soon"
            soon
          />
          <PlanCard
            name="Definitely Never Run Out"
            price="£14.99"
            priceSuffix=" /mo"
            description="For the prolific. An enormous allowance and priority access to new features."
            cta="Coming soon"
            soon
            highlighted
          />
          <PlanCard
            name="Top-ups"
            price="From £2.50"
            description={<>Carry-over prompts that never expire.<br /><br />The Snack — £2.50 / 50 prompts<br />The Pack — £5 / 100 prompts</>}
            cta="Coming soon"
            soon
          />
        </div>

        {/* Footer note */}
        <p style={{
          fontFamily:   'var(--font-sans)',
          fontSize:     '0.65rem',
          letterSpacing:'0.08em',
          textTransform:'uppercase',
          color:        'var(--color-ink-muted)',
          textAlign:    'center',
          marginTop:    '1rem',
        }}>
          All paid plans coming soon — get started free today.
        </p>

      </main>
    </div>
  )
}
