export default function HighDemandPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-parchment-dark)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
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
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-ink-muted)',
        }}>
          Service Status
        </span>
      </header>

      {/* Main */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>

        {/* Rule above */}
        <div style={{
          width: '3rem',
          borderTop: '3px double var(--color-ink)',
          marginBottom: '2.5rem',
        }} />

        {/* Kicker */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          marginBottom: '1.25rem',
        }}>
          Daily Capacity
        </p>

        {/* Headline */}
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--color-ink)',
          maxWidth: '580px',
          margin: '0 0 1.75rem',
        }}>
          A Remarkable Surge in Interest at Properly Prompt.
        </h2>

        {/* Rule */}
        <div style={{
          width: '2rem',
          borderTop: '1px solid var(--color-ink)',
          marginBottom: '1.75rem',
          opacity: 0.3,
        }} />

        {/* Body */}
        <p style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '1.1rem',
          fontStyle: 'italic',
          lineHeight: 1.75,
          color: 'var(--color-ink-muted)',
          maxWidth: '440px',
          margin: '0 0 3rem',
        }}>
          Due to unprecedented demand, we have reached our daily processing capacity.
          We shall return shortly.
        </p>

        {/* Rule below */}
        <div style={{
          width: '3rem',
          borderTop: '3px double var(--color-ink)',
          opacity: 0.2,
        }} />

      </main>

      {/* Footer */}
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
          Resets at midnight
        </span>
      </footer>
    </div>
  )
}
