import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypewriterHero from './TypewriterHero'
import { generateIndividualPrompt } from '../api'

const MODELS = ['Claude 3.5', 'GPT-4o', 'Gemini 1.5 Pro', 'Sora', 'Qwen3', 'Mistral Large']
const TASKS = ['Image Generation', 'Video Production', 'App / Web Dev', 'Data & Excel', 'Copywriting', 'Research']

export default function IndividualToolUI({ user, onOverLimit, onLogout }) {
  const [model, setModel] = useState(MODELS[0])
  const [task, setTask] = useState(TASKS[0])
  const [depth, setDepth] = useState('professional')
  const [userInput, setUserInput] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState(10)

  const inkColor = 'var(--color-ink)'
  const mutedColor = 'var(--color-ink-muted)'
  const accentColor = 'var(--color-accent)'
  const borderColor = 'var(--color-ink)'

  async function handleGenerate() {
    if (!userInput.trim() || isGenerating || credits <= 0) return
    setIsGenerating(true)
    setError('')
    try {
      const prompt = await generateIndividualPrompt({ model, task, depth, userInput })
      setGeneratedPrompt(prompt)
      setCredits((c) => Math.max(0, c - 1))
    } catch (err) {
      if (err.code === 'OVER_LIMIT') { onOverLimit?.(); return }
      setError('Failed to generate prompt. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-parchment)' }}>

      {/* Top navigation bar */}
      <header style={{
        borderBottom: `1px solid ${borderColor}`,
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.15rem',
            fontWeight: 900,
            color: inkColor,
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Properly Prompt
          </h1>
          <div style={{ width: 1, height: 20, background: borderColor, opacity: 0.3 }} />
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: mutedColor,
          }}>
            Individual Console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Credits counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: mutedColor,
            }}>Daily Credits</span>
            <div style={{
              border: `1px solid ${accentColor}`,
              padding: '0.15rem 0.5rem',
              color: accentColor,
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}>
              {credits} / 10
            </div>
          </div>

          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.7rem',
            color: mutedColor,
          }}>
            {user?.name || user?.email}
          </span>

          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: mutedColor,
              cursor: 'pointer',
              padding: 0,
            }}>
            Log out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Live preview section */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span className="kicker" style={{ color: accentColor }}>Live Preview</span>
            <div style={{ flex: 1, height: 1, background: borderColor, opacity: 0.15 }} />
          </div>
          <TypewriterHero blueprintMode={false} />
        </section>

        <hr style={{ borderTop: `1px solid ${borderColor}`, opacity: 0.2, marginBottom: '2.5rem' }} />

        {/* Controls row */}
        <section style={{ marginBottom: '2rem' }}>
          <p className="kicker" style={{ color: accentColor, marginBottom: '1rem' }}>Configure Your Prompt</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            {/* Model selector */}
            <div>
              <label style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: mutedColor,
                display: 'block',
                marginBottom: '0.4rem',
              }}>What model are you prompting?</label>
              <select
                className="press-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{ width: '100%' }}>
                {MODELS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            {/* Task selector */}
            <div>
              <label style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: mutedColor,
                display: 'block',
                marginBottom: '0.4rem',
              }}>Task Category</label>
              <select
                className="press-select"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                style={{ width: '100%' }}>
                {TASKS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Output depth */}
            <div>
              <label style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: mutedColor,
                display: 'block',
                marginBottom: '0.4rem',
              }}>Output Depth</label>
              <select
                className="press-select"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                style={{ width: '100%' }}>
                <option value="concise">Concise</option>
                <option value="professional">Professional</option>
                <option value="exhaustive">Exhaustive</option>
              </select>
            </div>
          </div>
        </section>

        {/* Input area */}
        <section style={{ marginBottom: '1.5rem' }}>
          <label style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: mutedColor,
            display: 'block',
            marginBottom: '0.5rem',
          }}>Your Rough Idea</label>
          <div style={{
            border: `1px solid ${borderColor}`,
            padding: '1rem',
            position: 'relative',
          }}>
            <textarea
              rows={3}
              placeholder='e.g. "make me a logo" or "help me write an email"'
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                color: inkColor,
                lineHeight: 1.6,
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '0.5rem',
              right: '0.75rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.65rem',
              color: mutedColor,
            }}>
              {model} · {task} · {depth}
            </div>
          </div>
        </section>

        {/* Generate button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <button
            className="wax-seal"
            onClick={handleGenerate}
            disabled={isGenerating || !userInput.trim() || credits <= 0}
            style={{ opacity: (!userInput.trim() || isGenerating || credits <= 0) ? 0.5 : 1 }}>
            {isGenerating ? 'Engineering...' : 'Engineer My Prompt'}
          </button>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: mutedColor }}>
            {credits > 0 ? 'Uses 1 credit' : 'No credits remaining'}
          </span>
        </div>

        {/* Error state */}
        {error && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            color: 'var(--color-accent)',
            marginBottom: '1.5rem',
          }}>
            {error}
          </p>
        )}

        {/* Output area */}
        <AnimatePresence>
          {generatedPrompt && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span className="kicker" style={{ color: accentColor }}>Engineered Prompt</span>
                <div style={{ flex: 1, height: 1, background: borderColor, opacity: 0.15 }} />
                <button
                  className="ink-stamp"
                  onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                  style={{ fontSize: '0.6rem', padding: '0.3rem 0.8rem' }}>
                  Copy
                </button>
              </div>
              <div style={{
                border: `1px solid ${borderColor}`,
                padding: '1.5rem',
                background: 'var(--color-parchment-dark)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-garamond)',
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: inkColor,
                  fontStyle: 'italic',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}>
                  {generatedPrompt}
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

      </main>
    </motion.div>
  )
}
