import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SEQUENCES = [
  {
    category: 'Image Generation',
    // Rubbish: casual human handwriting
    rubbish: 'can you make me a pic of a dog and cat together',
    // Quality: proper prompt syntax, written by the tool
    quality:
      'photorealistic 8K portrait :: golden retriever + siamese cat :: volumetric lighting :: 35mm f/1.8 :: golden hour :: hasselblad medium format :: shallow DOF :: award-winning --ar 4:5 --style raw --v 6',
    label: 'Midjourney / DALL-E',
  },
  {
    category: 'Video Production',
    rubbish: 'make me a cool video of tokyo or something',
    quality:
      'cinematic drone shot :: neon-lit tokyo rain :: 120fps slow-motion :: anamorphic 2.39:1 :: wet pavement reflections :: christopher doyle cinematography :: melancholic mood :: 4K --duration 12s --sora --style cinematic',
    label: 'Sora / RunwayML',
  },
  {
    category: 'App Development',
    rubbish: 'build me a website with like a dashboard',
    quality:
      'role: senior react developer | task: analytics dashboard | stack: react 18 + tailwind + lucide | state: zustand | requirements: aria-compliant, dark mode, skeleton loaders, modular components | output: production-ready code',
    label: 'GPT-4o / Claude',
  },
  {
    category: 'Automation',
    rubbish: 'help me do something in excel for my sales',
    quality:
      'task: VBA macro :: scope: B2B sales pipeline :: features: multi-sheet validation + conditional formatting + PDF export via wshell + error handling with MsgBox + scheduled refresh subroutine :: output: .bas module, enterprise-grade',
    label: 'Claude / GPT-4o',
  },
]

// Timing constants (ms)
const RUBBISH_SPEED = 75
const QUALITY_SPEED = 16
const BACKSPACE_SPEED = 22
const PAUSE_AFTER_RUBBISH = 1400
const PAUSE_AFTER_QUALITY = 3500
const PAUSE_BEFORE_NEXT = 500

export default function TypewriterHero({ blueprintMode = false }) {
  const [seqIndex, setSeqIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState('typing-rubbish')
  const timeoutRef = useRef(null)

  const seq = SEQUENCES[seqIndex]

  useEffect(() => {
    clearTimeout(timeoutRef.current)

    function schedule(fn, delay) {
      timeoutRef.current = setTimeout(fn, delay)
    }

    if (phase === 'typing-rubbish') {
      if (displayed.length < seq.rubbish.length) {
        schedule(() => setDisplayed(seq.rubbish.slice(0, displayed.length + 1)), RUBBISH_SPEED)
      } else {
        schedule(() => setPhase('pause-rubbish'), PAUSE_AFTER_RUBBISH)
      }
    }
    else if (phase === 'pause-rubbish') {
      schedule(() => setPhase('backspacing'), 0)
    }
    else if (phase === 'backspacing') {
      if (displayed.length > 0) {
        schedule(() => setDisplayed((prev) => prev.slice(0, -1)), BACKSPACE_SPEED)
      } else {
        schedule(() => setPhase('typing-quality'), PAUSE_BEFORE_NEXT)
      }
    }
    else if (phase === 'typing-quality') {
      if (displayed.length < seq.quality.length) {
        schedule(() => setDisplayed(seq.quality.slice(0, displayed.length + 1)), QUALITY_SPEED)
      } else {
        schedule(() => setPhase('pause-quality'), PAUSE_AFTER_QUALITY)
      }
    }
    else if (phase === 'pause-quality') {
      schedule(() => {
        setDisplayed('')
        setPhase('typing-rubbish')
        setSeqIndex((i) => (i + 1) % SEQUENCES.length)
      }, 0)
    }

    return () => clearTimeout(timeoutRef.current)
  }, [phase, displayed, seq])

  const isRubbish = phase === 'typing-rubbish' || phase === 'pause-rubbish' || phase === 'backspacing'
  const isQuality = phase === 'typing-quality' || phase === 'pause-quality'

  const accentColor = blueprintMode ? '#5b9bd5' : 'var(--color-accent)'
  const mutedColor = blueprintMode ? '#4a6b8a' : 'var(--color-ink-muted)'
  const inkColor = blueprintMode ? 'var(--color-blueprint-text)' : 'var(--color-ink)'
  const borderColor = blueprintMode ? 'var(--color-blueprint-line)' : 'rgba(26,26,24,0.25)'
  const bgColor = blueprintMode ? 'rgba(30, 58, 95, 0.4)' : 'rgba(253,251,247,0.7)'

  return (
    <div style={{ width: '100%' }}>

      {/* Header row: category + sequence dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={seqIndex}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: accentColor,
            }}>
              {seq.category}
            </span>
            <span style={{
              border: `1px solid ${accentColor}`,
              color: accentColor,
              fontFamily: 'var(--font-sans)',
              fontSize: '0.6rem',
              letterSpacing: '0.06em',
              padding: '0.1rem 0.45rem',
            }}>
              {seq.label}
            </span>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: '5px' }}>
          {SEQUENCES.map((_, i) => (
            <div key={i} style={{
              width: 5, height: 5,
              background: i === seqIndex ? inkColor : mutedColor,
              opacity: i === seqIndex ? 1 : 0.25,
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Main typewriter box */}
      <div style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        padding: '2rem 2.25rem',
        minHeight: '140px',
        position: 'relative',
      }}>
        {/* Corner brackets */}
        {[
          { top: -1, left: -1, borderTop: true, borderLeft: true },
          { top: -1, right: -1, borderTop: true, borderRight: true },
          { bottom: -1, left: -1, borderBottom: true, borderLeft: true },
          { bottom: -1, right: -1, borderBottom: true, borderRight: true },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 10, height: 10,
            top: pos.top, bottom: pos.bottom,
            left: pos.left, right: pos.right,
            borderTop: pos.borderTop ? `2px solid ${accentColor}` : 'none',
            borderBottom: pos.borderBottom ? `2px solid ${accentColor}` : 'none',
            borderLeft: pos.borderLeft ? `2px solid ${accentColor}` : 'none',
            borderRight: pos.borderRight ? `2px solid ${accentColor}` : 'none',
          }} />
        ))}

        {/* Status bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '1.25rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.6rem',
            letterSpacing: '0.12em', textTransform: 'uppercase', color: mutedColor,
          }}>Input</span>
          <div style={{ flex: 1, height: '1px', background: borderColor, opacity: 0.6 }} />
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.6rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: isQuality ? accentColor : mutedColor,
            transition: 'color 0.3s',
          }}>
            {isQuality ? '● Properly Prompt' : '○ Raw Input'}
          </span>
        </div>

        {/* The text itself */}
        <p style={{
          margin: 0,
          minHeight: '4rem',
          wordBreak: 'break-word',
          lineHeight: 1.7,
          // Rubbish = EB Garamond italic (handwritten feel)
          // Quality = JetBrains Mono (machine/tool output)
          fontFamily: isQuality ? 'var(--font-mono)' : 'var(--font-garamond)',
          fontSize: isQuality ? '1.05rem' : '1.25rem',
          fontStyle: isRubbish ? 'italic' : 'normal',
          color: isQuality ? inkColor : mutedColor,
          fontWeight: isQuality ? 400 : 400,
          transition: 'color 0.4s',
          letterSpacing: isQuality ? '-0.01em' : '0',
        }}>
          {displayed}
          <span className={`cursor ${blueprintMode ? 'blueprint-cursor' : ''}`} />
        </p>
      </div>

      {/* Quality bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: '0.6rem',
          letterSpacing: '0.1em', textTransform: 'uppercase', color: mutedColor,
          whiteSpace: 'nowrap',
        }}>Prompt Quality</span>
        <div style={{
          flex: 1, height: '2px',
          background: blueprintMode ? 'rgba(168,196,224,0.12)' : 'rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}>
          <motion.div
            style={{ height: '100%', background: accentColor, originX: 0 }}
            animate={{ scaleX: isRubbish ? 0.08 : isQuality ? 1 : 0 }}
            transition={{ duration: isQuality ? 1.4 : 0.35, ease: 'easeOut' }}
          />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          color: isQuality ? accentColor : mutedColor,
          fontWeight: 500, minWidth: '2.5rem', textAlign: 'right',
          transition: 'color 0.3s',
        }}>
          {isQuality ? '97%' : (phase === 'typing-rubbish' || phase === 'pause-rubbish') ? '08%' : '—'}
        </span>
      </div>
    </div>
  )
}
