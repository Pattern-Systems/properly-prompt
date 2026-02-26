import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// ─── Load .env manually (no dotenv dependency needed) ───────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

// ─── Database Init ────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'db.sqlite'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    name          TEXT    DEFAULT '',
    tier          TEXT    DEFAULT 'Individual',
    created_at    TEXT    DEFAULT (datetime('now'))
  )
`)

// Safe migration — add plan column to existing databases
try { db.exec(`ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free'`) } catch { /* already exists */ }

db.exec(`
  CREATE TABLE IF NOT EXISTS redeemed_codes (
    code        TEXT    UNIQUE NOT NULL,
    user_id     INTEGER NOT NULL,
    redeemed_at TEXT    DEFAULT (datetime('now'))
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER,
    user_email TEXT,
    tier       TEXT,
    reason     TEXT,
    timestamp  INTEGER,
    created_at TEXT    DEFAULT (datetime('now'))
  )
`)

// ─── JWT Helpers ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = '30d'

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, tier: user.tier },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}

function verifyToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET)
  } catch {
    return null
  }
}

// ─── Model Configuration ─────────────────────────────────────────────────────
const INDIVIDUAL_MODEL = 'gemini-1.5-flash'
const BUSINESS_MODEL   = 'gemini-3-flash-preview'

// ─── Pricing (USD per token → GBP) ──────────────────────────────────────────
const INDIVIDUAL_INPUT_PRICE_USD  = 0.075 / 1_000_000
const INDIVIDUAL_OUTPUT_PRICE_USD = 0.30  / 1_000_000
const BUSINESS_INPUT_PRICE_USD    = 0.10  / 1_000_000
const BUSINESS_OUTPUT_PRICE_USD   = 0.40  / 1_000_000
const USD_TO_GBP = 0.787

// ─── Global Daily Spend Tracker ──────────────────────────────────────────────
const DAILY_LIMIT_GBP = 7.50
const spend = { date: '', totalGBP: 0 }

function getTodayKey() { return new Date().toDateString() }

function checkAndResetSpend() {
  const today = getTodayKey()
  if (spend.date !== today) {
    spend.date = today
    spend.totalGBP = 0
  }
}

function recordSpend(gbpAmount) {
  checkAndResetSpend()
  spend.totalGBP += gbpAmount
}

function isOverLimit() {
  checkAndResetSpend()
  return spend.totalGBP >= DAILY_LIMIT_GBP
}

// ─── Secret Sauce System Prompts ─────────────────────────────────────────────
function buildSystemPrompt(tier, model, task, depth) {
  if (tier === 'business') {
    return `You are a Senior Systems Architect for Properly Prompt. Transform requests into high-performance, production-ready prompts for ${model}. You MUST include technical constraints, error-handling logic, and efficiency optimizations. Focus on business ROI and scalability.

Task Category: ${task}
Output Depth: ${depth}
Mode: Enterprise Blueprint

Instructions:
- Return ONLY the engineered prompt — no meta-commentary, no explanation
- Structure with enterprise precision: role definition, task scope, technical requirements, output specifications, constraints, success criteria
- Concise: executive-summary prompt with clear objective, expected output, and primary constraint
- Professional: full specification with defined sections, measurable requirements, and efficiency directives
- Exhaustive: complete technical blueprint with all parameters, edge cases, error-handling logic, validation rules, and deliverable format
- Optimize for production deployment, team handoff, scalability, and measurable business ROI
- Return ONLY the prompt text`
  }

  return `You are a Creative Prompt Assistant for Properly Prompt. Transform simple requests into artistic, descriptive, and vivid prompts for ${model}. Focus on aesthetics, tone, and sensory detail.

Task Category: ${task}
Output Depth: ${depth}

Instructions:
- Return ONLY the engineered prompt — no preamble, no explanation, no "Here's your prompt:"
- Tailor syntax to ${model}: Midjourney/DALL-E use :: separators and --flags; GPT-4o/Claude use rich natural language; Sora uses cinematic descriptors; code models use role + stack + requirements
- Concise: 1–2 vivid, impactful sentences
- Professional: structured prompt with key aesthetic parameters and context
- Exhaustive: comprehensive prompt with all sensory details, mood, style references, and technical parameters
- Make it immediately copy-paste ready`
}

// ─── Core Gemini Call (server-side only) ─────────────────────────────────────
async function callGemini(modelId, systemPrompt, userMessage, isBusinessTier) {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) throw new Error('GOOGLE_API_KEY is not configured on the server.')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userMessage }] }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errText}`)
  }

  const data = await response.json()

  // Track spend from real token counts
  const inputTokens  = data.usageMetadata?.promptTokenCount     ?? 0
  const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0
  const inputPrice   = isBusinessTier ? BUSINESS_INPUT_PRICE_USD  : INDIVIDUAL_INPUT_PRICE_USD
  const outputPrice  = isBusinessTier ? BUSINESS_OUTPUT_PRICE_USD : INDIVIDUAL_OUTPUT_PRICE_USD
  const costGBP      = ((inputTokens * inputPrice) + (outputTokens * outputPrice)) * USD_TO_GBP
  recordSpend(costGBP)

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'
}

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// POST /api/generate
app.post('/api/generate', async (req, res) => {
  const { tier, model, task, depth, userInput } = req.body ?? {}

  if (!tier || !model || !task || !depth || !userInput?.trim()) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  if (isOverLimit()) {
    return res.status(429).json({ code: 'OVER_LIMIT', error: 'Daily capacity reached.' })
  }

  try {
    const isBusinessTier = tier === 'business'
    const modelId        = isBusinessTier ? BUSINESS_MODEL : INDIVIDUAL_MODEL
    const systemPrompt   = buildSystemPrompt(tier, model, task, depth)
    const prompt         = await callGemini(modelId, systemPrompt, userInput, isBusinessTier)

    // Audit log — extract user from token if present (optional auth)
    try {
      const payload = verifyToken(req.headers.authorization)
      db.prepare(
        'INSERT INTO audit_log (user_id, user_email, tier, reason, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).run(payload?.id ?? null, payload?.email ?? null, tier, 'prompt_generation', Date.now())
    } catch { /* non-blocking — never fail a generation over audit */ }

    res.json({ prompt })
  } catch (err) {
    console.error('[/api/generate]', err.message)
    res.status(500).json({ error: 'Generation failed. Please try again.' })
  }
})

// POST /api/webhook/signup — proxies GHL so the webhook URL stays server-side
app.post('/api/webhook/signup', async (req, res) => {
  const ghlUrl = process.env.GHL_WEBHOOK_URL
  if (!ghlUrl) return res.status(500).json({ error: 'Webhook not configured.' })

  try {
    await fetch(ghlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    res.json({ ok: true })
  } catch (err) {
    // Non-blocking — log but don't fail the signup
    console.error('[/api/webhook/signup]', err.message)
    res.json({ ok: true })
  }
})

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, tier } = req.body ?? {}
  if (!email || !password || !tier) return res.status(400).json({ error: 'Missing fields.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' })

  const password_hash = await bcrypt.hash(password, 12)
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, tier) VALUES (?, ?, ?, ?)'
  ).run(email.toLowerCase(), password_hash, name ?? '', tier)

  const user = { id: result.lastInsertRowid, email: email.toLowerCase(), name: name ?? '', tier }
  res.json({ token: signToken(user), user: { name: user.name, email: user.email, tier: user.tier } })
})

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ error: 'Missing fields.' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' })

  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) return res.status(401).json({ error: 'Invalid email or password.' })

  res.json({ token: signToken(user), user: { name: user.name, email: user.email, tier: user.tier } })
})

// GET /api/auth/me — restore session from token
app.get('/api/auth/me', (req, res) => {
  const payload = verifyToken(req.headers.authorization)
  if (!payload) return res.status(401).json({ error: 'Unauthorised.' })

  const user = db.prepare('SELECT name, email, tier FROM users WHERE id = ?').get(payload.id)
  if (!user) return res.status(401).json({ error: 'User not found.' })
  res.json({ user })
})

// POST /api/auth/redeem-code — validate + consume a one-time burner code
const BURNER_CODES = ['lee unlimited', 'josh unlimited', 'dan unlimited']

app.post('/api/auth/redeem-code', (req, res) => {
  const payload = verifyToken(req.headers.authorization)
  if (!payload) return res.status(401).json({ error: 'You must be logged in to redeem a code.' })

  const { code } = req.body ?? {}
  if (!code?.trim()) return res.status(400).json({ error: 'No code provided.' })

  const normalised = code.trim().toLowerCase()
  if (!BURNER_CODES.includes(normalised)) {
    return res.status(400).json({ error: 'Invalid code.' })
  }

  const already = db.prepare('SELECT user_id FROM redeemed_codes WHERE code = ?').get(normalised)
  if (already) return res.status(409).json({ error: 'This code has already been redeemed.' })

  db.prepare('INSERT INTO redeemed_codes (code, user_id) VALUES (?, ?)').run(normalised, payload.id)
  db.prepare("UPDATE users SET plan = 'partner' WHERE id = ?").run(payload.id)

  res.json({ success: true, plan: 'partner', credits: 10000 })
})

// Production: serve the Vite build
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`)
  if (!process.env.GOOGLE_API_KEY) {
    console.warn('[server] WARNING: GOOGLE_API_KEY is not set. API calls will fail.')
  }
})
