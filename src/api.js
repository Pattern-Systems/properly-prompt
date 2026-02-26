// ─── Model Configuration ────────────────────────────────────────────────────
const GOOGLE_API_KEY = 'AIzaSyCl93VVNhx_zdCYE4foH1g4kAivK7fj53Y'
const INDIVIDUAL_MODEL = 'gemini-1.5-flash'
const BUSINESS_MODEL = 'gemini-3-flash-preview'

// ─── Pricing (USD per token, then converted to GBP) ─────────────────────────
// Gemini 1.5 Flash
const INDIVIDUAL_INPUT_PRICE_USD  = 0.075  / 1_000_000
const INDIVIDUAL_OUTPUT_PRICE_USD = 0.30   / 1_000_000
// Gemini 3 Flash Preview (conservative estimate)
const BUSINESS_INPUT_PRICE_USD    = 0.10   / 1_000_000
const BUSINESS_OUTPUT_PRICE_USD   = 0.40   / 1_000_000

const USD_TO_GBP = 0.787 // approximate fixed rate

// ─── Daily Spend Tracking (localStorage, per device) ────────────────────────
// NOTE: This provides per-user protection. For a global kill switch across all
// users, a backend database is required.
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

function addToSpend(gbpAmount) {
  const current = getDailySpend()
  const updated = current + gbpAmount
  localStorage.setItem(SPEND_KEY, updated.toString())
  return updated
}

export function isOverDailyLimit() {
  return getDailySpend() >= DAILY_LIMIT_GBP
}

// ─── Core Gemini API Call ────────────────────────────────────────────────────
async function callGemini(modelId, systemPrompt, userMessage, isBusinessTier = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GOOGLE_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          parts: [{ text: userMessage }],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${err}`)
  }

  const data = await response.json()

  // Track spend using actual token counts from the API response
  const inputTokens  = data.usageMetadata?.promptTokenCount     ?? 0
  const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0

  const inputPrice  = isBusinessTier ? BUSINESS_INPUT_PRICE_USD  : INDIVIDUAL_INPUT_PRICE_USD
  const outputPrice = isBusinessTier ? BUSINESS_OUTPUT_PRICE_USD : INDIVIDUAL_OUTPUT_PRICE_USD
  const costGBP     = ((inputTokens * inputPrice) + (outputTokens * outputPrice)) * USD_TO_GBP
  addToSpend(costGBP)

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'
}

// ─── Tiered Prompt Generation ────────────────────────────────────────────────

export async function generateIndividualPrompt({ model, task, depth, userInput }) {
  const systemPrompt = `You are a Creative Prompt Assistant for Properly Prompt. Transform simple requests into artistic, descriptive, and vivid prompts for ${model}. Focus on aesthetics, tone, and sensory detail.

Task Category: ${task}
Output Depth: ${depth}

Instructions:
- Return ONLY the engineered prompt — no preamble, no explanation, no "Here's your prompt:"
- Tailor syntax to ${model}: Midjourney/DALL-E use :: separators and --flags; GPT-4o/Claude use rich natural language; Sora uses cinematic descriptors; code models use role + stack + requirements
- Concise: 1–2 vivid, impactful sentences
- Professional: structured prompt with key aesthetic parameters and context
- Exhaustive: comprehensive prompt with all sensory details, mood, style references, and technical parameters
- Make it immediately copy-paste ready`

  return callGemini(INDIVIDUAL_MODEL, systemPrompt, userInput, false)
}

export async function generateBusinessPrompt({ model, task, depth, userInput }) {
  const systemPrompt = `You are a Senior Systems Architect for Properly Prompt. Transform requests into high-performance, production-ready prompts for ${model}. You MUST include technical constraints, error-handling logic, and efficiency optimizations. Focus on business ROI and scalability.

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

  return callGemini(BUSINESS_MODEL, systemPrompt, userInput, true)
}

// ─── GoHighLevel Webhook ─────────────────────────────────────────────────────

export async function triggerGHLWebhook(name, email, tier) {
  try {
    await fetch(
      'https://services.leadconnectorhq.com/hooks/O3AdfPU5EASbqx9BYTyz/webhook-trigger/462cd1e0-06e9-447c-9e7e-33196bd25048',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, tier }),
      }
    )
  } catch (err) {
    // Non-blocking — auth proceeds regardless of webhook failure
    console.error('GHL webhook error:', err)
  }
}
