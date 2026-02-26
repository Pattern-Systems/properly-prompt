import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypewriterHero from './TypewriterHero'

const MODELS = ['Claude 3.5', 'GPT-4o', 'Gemini 1.5 Pro', 'Sora', 'Qwen3', 'Mistral Large']
const TASKS = ['Image Generation', 'Video Production', 'App / Web Dev', 'Data & Excel', 'Copywriting', 'Research']

// Placeholder for Qwen3 API
async function generatePrompt({ model, task, mode, userInput }) {
  // TODO: integrate Qwen3 API
  // const response = await fetch('/api/generate', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ model, task, mode, userInput }),
  // })
  // return response.json()
  console.log('Generating prompt via Qwen3 API:', { model, task, mode, userInput })
  return { prompt: '// Qwen3 API response will appear here' }
}

export default function ToolUI({ user }) {
  const [model, setModel] = useState(MODELS[0])
  const [task, setTask] = useState(TASKS[0])
  const [mode, setMode] = useState('hobbyist') // 'hobbyist' | 'business'
  const [userInput, setUserInput] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [credits] = useState(10)

  const isBlueprint = mode === 'business'

  async function handleGenerate() {
    if (!userInput.trim()) return
    setIsGenerating(true)
    try {
      const result = await generatePrompt({ model, task, mode, userInput })
      setGeneratedPrompt(result.prompt)
    } finally {
      setIsGenerating(false)
    }
  }

  const inkColor = isBlueprint ? 'var(--color-blueprint-text)' : 'var(--color-ink)'
  const mutedColor = isBlueprint ? '#4a6b8a' : 'var(--color-ink-muted)'
  const accentColor = isBlueprint ? '#5b9bd5' : 'var(--color-accent)'
  const borderColor = isBlueprint ? 'var(--color-blueprint-line)' : 'var(--color-ink)'
  const bgClass = isBlueprint ? 'blueprint-grid' : ''

  return (
    <motion.div
      className={`min-h-screen ${bgClass}`}
      animate={{
        backgroundColor: isBlueprint ? 'var(--color-blueprint)' : 'var(--color-parchment)',
      }}
      transition={{ duration: 0.5 }}>

      {/* Top navigation bar */}
      <header style={{
        borderBottom: `1px solid ${borderColor}`,
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-xl font-black" style={{ color: inkColor }}>
            Properly Prompt
          </h1>
          <div style={{ width: 1, height: 20, background: borderColor, opacity: 0.4 }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', color: mutedColor }}>
            The Architect's Console
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Credits counter */}
          <div className="flex items-center gap-2">
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
              letterSpacing: '0.1em', textTransform: 'uppercase', color: mutedColor,
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

          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            border: `1px solid ${borderColor}`,
            overflow: 'hidden',
          }}>
            {['hobbyist', 'business'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: mode === m
                    ? (isBlueprint ? 'var(--color-blueprint-line)' : 'var(--color-ink)')
                    : 'transparent',
                  color: mode === m
                    ? (isBlueprint ? 'var(--color-blueprint-text)' : 'var(--color-parchment)')
                    : mutedColor,
                }}>
                {m === 'hobbyist' ? 'Hobbyist' : 'Business'}
              </button>
            ))}
          </div>

          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: mutedColor,
          }}>
            {user?.name || user?.email}
          </span>
        </div>
      </header>

      {/* Blueprint mode banner */}
      <AnimatePresence>
        {isBlueprint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              borderBottom: `1px solid var(--color-blueprint-line)`,
              background: 'rgba(30, 58, 95, 0.6)',
              padding: '0.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'var(--color-blueprint-text)',
            }}>
              ◈ Technical Blueprint Mode — Enterprise-grade prompt engineering
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-blueprint-line)' }} />
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
              color: '#4a6b8a', letterSpacing: '0.08em',
            }}>
              REV. 2.4.1 / ARCHITECT CONSOLE
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Live preview section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="kicker" style={{ color: accentColor }}>Live Preview</span>
            <div style={{ flex: 1, height: 1, background: borderColor, opacity: 0.2 }} />
          </div>
          <TypewriterHero blueprintMode={isBlueprint} />
        </section>

        <hr style={{ borderTop: `1px solid ${borderColor}`, opacity: 0.3, marginBottom: '2.5rem' }} />

        {/* Controls row */}
        <section className="mb-8">
          <p className="kicker mb-4" style={{ color: accentColor }}>Configure Your Prompt</p>

          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {/* Model selector */}
            <div>
              <label style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: mutedColor, display: 'block', marginBottom: '0.4rem',
              }}>AI Model</label>
              <div style={{ position: 'relative' }}>
                <select
                  className={`press-select w-full ${isBlueprint ? 'blueprint-select' : ''}`}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{ width: '100%' }}>
                  {MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Task selector */}
            <div>
              <label style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: mutedColor, display: 'block', marginBottom: '0.4rem',
              }}>Task Category</label>
              <select
                className={`press-select w-full ${isBlueprint ? 'blueprint-select' : ''}`}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                style={{ width: '100%' }}>
                {TASKS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Context / depth */}
            <div>
              <label style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: mutedColor, display: 'block', marginBottom: '0.4rem',
              }}>Output Depth</label>
              <select
                className={`press-select w-full ${isBlueprint ? 'blueprint-select' : ''}`}
                defaultValue="professional"
                style={{ width: '100%' }}>
                <option value="concise">Concise</option>
                <option value="professional">Professional</option>
                <option value="exhaustive">Exhaustive</option>
              </select>
            </div>
          </div>
        </section>

        {/* Input area */}
        <section className="mb-6">
          <label style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: mutedColor, display: 'block', marginBottom: '0.5rem',
          }}>Your Rough Idea</label>
          <div style={{
            border: `1px solid ${borderColor}`,
            padding: '1rem',
            position: 'relative',
          }}>
            <textarea
              rows={3}
              placeholder={isBlueprint
                ? 'Describe your technical requirement or business objective...'
                : 'e.g. "make me a logo" or "help me write an email"'}
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
              position: 'absolute', bottom: '0.5rem', right: '0.75rem',
              fontFamily: 'var(--font-sans)', fontSize: '0.65rem', color: mutedColor,
            }}>
              {model} · {task} · {mode}
            </div>
          </div>
        </section>

        {/* Generate button */}
        <div className="flex items-center gap-4 mb-10">
          <button
            className="wax-seal"
            onClick={handleGenerate}
            disabled={isGenerating || !userInput.trim()}
            style={{ opacity: (!userInput.trim() || isGenerating) ? 0.5 : 1 }}>
            {isGenerating ? 'Engineering...' : 'Engineer My Prompt'}
          </button>
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: mutedColor,
          }}>
            Uses 1 credit
          </span>
        </div>

        {/* Output area */}
        <AnimatePresence>
          {generatedPrompt && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="kicker" style={{ color: accentColor }}>Engineered Prompt</span>
                <div style={{ flex: 1, height: 1, background: borderColor, opacity: 0.2 }} />
                <button
                  className="ink-stamp"
                  onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                  style={{
                    fontSize: '0.6rem',
                    padding: '0.3rem 0.8rem',
                    borderColor: isBlueprint ? 'var(--color-blueprint-line)' : 'var(--color-ink)',
                    color: isBlueprint ? 'var(--color-blueprint-text)' : 'var(--color-ink)',
                  }}>
                  Copy
                </button>
              </div>
              <div style={{
                border: `1px solid ${borderColor}`,
                padding: '1.5rem',
                background: isBlueprint ? 'rgba(30,58,95,0.4)' : 'var(--color-parchment-dark)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-garamond)',
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: inkColor,
                  fontStyle: 'italic',
                  margin: 0,
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
