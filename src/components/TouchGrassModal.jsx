import { motion } from 'framer-motion'

export default function TouchGrassModal({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-parchment)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        padding: '2rem',
        textAlign: 'center',
      }}>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.6rem',
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--color-accent)',
        marginBottom: '2rem',
      }}>
        Hard Cap Reached
      </p>

      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
        fontWeight: 900,
        color: 'var(--color-ink)',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        maxWidth: '620px',
        marginBottom: '1.75rem',
      }}>
        We can't believe you've burnt through that many prompts.
      </h1>

      <p style={{
        fontFamily: 'var(--font-garamond)',
        fontSize: '1.3rem',
        fontStyle: 'italic',
        color: 'var(--color-ink)',
        maxWidth: '500px',
        lineHeight: 1.5,
        marginBottom: '0.6rem',
      }}>
        You need help.
      </p>

      <p style={{
        fontFamily: 'var(--font-garamond)',
        fontSize: '1.05rem',
        fontStyle: 'italic',
        color: 'var(--color-ink-muted)',
        maxWidth: '500px',
        lineHeight: 1.6,
        marginBottom: '3rem',
      }}>
        Touch Grass. (Or wait until your billing cycle resets.)
      </p>

      <div style={{ width: 40, height: 1, background: 'var(--color-ink)', opacity: 0.2, marginBottom: '3rem' }} />

      <button
        className="wax-seal"
        onClick={onDismiss}
        style={{ fontSize: '0.8rem', padding: '0.55rem 1.75rem' }}>
        OK, fine.
      </button>
    </motion.div>
  )
}
