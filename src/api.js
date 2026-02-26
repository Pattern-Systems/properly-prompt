// ─── Session (JWT in localStorage) ───────────────────────────────────────────
const SESSION_KEY = 'pp_session'

export async function signup({ name, email, password, tier }) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, tier }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Signup failed.')
  localStorage.setItem(SESSION_KEY, data.token)
  return data.user
}

export async function login({ email, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Login failed.')
  localStorage.setItem(SESSION_KEY, data.token)
  return data.user
}

export async function getMe() {
  const token = localStorage.getItem(SESSION_KEY)
  if (!token) return null
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) { localStorage.removeItem(SESSION_KEY); return null }
  const data = await res.json()
  return data.user
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Daily Spend UI (localStorage) ───────────────────────────────────────────
// Used only for the credits counter display.
// Actual spend enforcement is handled server-side.
const DAILY_LIMIT_GBP = 7.50
const SPEND_KEY = 'pp_daily_spend'
const DATE_KEY  = 'pp_spend_date'

function getTodayKey() {
  return new Date().toDateString()
}

export function getDailySpend() {
  const today = getTodayKey()
  if (localStorage.getItem(DATE_KEY) !== today) {
    localStorage.setItem(DATE_KEY, today)
    localStorage.setItem(SPEND_KEY, '0')
    return 0
  }
  return parseFloat(localStorage.getItem(SPEND_KEY) || '0')
}

export function isOverDailyLimit() {
  return getDailySpend() >= DAILY_LIMIT_GBP
}

// ─── Shared fetch helper ──────────────────────────────────────────────────────
async function postGenerate(payload) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (response.status === 429) {
    const err = new Error('Daily capacity reached.')
    err.code = 'OVER_LIMIT'
    throw err
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? 'Generation failed.')
  }

  const data = await response.json()
  return data.prompt
}

// ─── Tiered Prompt Generation ─────────────────────────────────────────────────
// The server owns the API key and system prompts. The browser only sends context.

export async function generateIndividualPrompt({ model, task, depth, userInput }) {
  return postGenerate({ tier: 'individual', model, task, depth, userInput })
}

export async function generateBusinessPrompt({ model, task, depth, userInput }) {
  return postGenerate({ tier: 'business', model, task, depth, userInput })
}

// ─── GoHighLevel Webhook (proxied through server) ─────────────────────────────
export async function triggerGHLWebhook(name, email, tier) {
  try {
    await fetch('/api/webhook/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, tier }),
    })
  } catch (err) {
    // Non-blocking
    console.error('Signup webhook error:', err)
  }
}
