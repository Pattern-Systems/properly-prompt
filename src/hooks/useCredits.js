import { useState, useEffect } from 'react'
import {
  getInitialCreditState,
  applyDailyReset,
  canAfford,
  consume,
  addTopUpCredits as addTopUpFn,
  applySubscription,
  getDisplayCredits,
  createAuditEntry,
  TOP_UPS,
} from '../lib/credits'

// ─── Persistence ──────────────────────────────────────────────────────────────
// auditLog is in-memory only and never written to localStorage.

const STORAGE_KEY = 'pp_credits_v2'

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistState(state) {
  try {
    const { auditLog, ...persistable } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  } catch { /* storage unavailable — degrade silently */ }
}

function buildInitialState() {
  const persisted = loadPersistedState()
  const base      = getInitialCreditState()
  if (!persisted) return base
  // Merge persisted keys over base defaults (handles new keys across deploys)
  const merged = { ...base, ...persisted, auditLog: [] }
  return applyDailyReset(merged)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCredits() {
  const [state, setState]               = useState(buildInitialState)
  const [syncing, setSyncing]           = useState(false)
  const [showTouchGrass, setShowTouchGrass] = useState(false)

  // Persist on every state change (excludes auditLog)
  useEffect(() => { persistState(state) }, [state])

  // Re-run daily reset when the user returns to the tab after midnight
  useEffect(() => {
    function onFocus() { setState(s => applyDailyReset(s)) }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const affordable     = canAfford(state)
  const displayCredits = getDisplayCredits(state)

  // ─── consumeCredit ─────────────────────────────────────────────────────────
  // Pass userId + tier so every generation can be audit-logged.

  async function consumeCredit(userId, tier) {
    if (!canAfford(state)) {
      setShowTouchGrass(true)
      return false
    }

    setSyncing(true)
    const entry = createAuditEntry(userId, tier)

    // ── Future backend: consume + audit in one request ───────────────────────
    // try {
    //   await fetch('/api/credits/consume', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${localStorage.getItem('pp_session')}`,
    //     },
    //     body: JSON.stringify({ amount: 1, reason: 'prompt_generation', auditEntry: entry }),
    //   })
    // } catch (err) {
    //   console.error('[CreditService] consume sync failed:', err)
    // }
    // ─────────────────────────────────────────────────────────────────────────

    setState(s => ({ ...consume(s), auditLog: [...s.auditLog, entry] }))
    await new Promise(r => setTimeout(r, 500))
    setSyncing(false)
    return true
  }

  // ─── addCredits ────────────────────────────────────────────────────────────
  // Used by referral bonuses and any manual grants. Goes into the top-up bucket.

  async function addCredits(amount, reason = 'referral_bonus') {
    setSyncing(true)

    // ── Future backend: POST /api/credits/add ────────────────────────────────
    // await fetch('/api/credits/add', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${localStorage.getItem('pp_session')}`,
    //   },
    //   body: JSON.stringify({ amount, reason }),
    // })
    // ── Airtable / Supabase sync ─────────────────────────────────────────────
    // await fetch('/api/sync/credits', { method: 'POST', body: JSON.stringify({ amount, reason }) })
    // ─────────────────────────────────────────────────────────────────────────

    setState(s => addTopUpFn(s, amount))
    await new Promise(r => setTimeout(r, 500))
    setSyncing(false)
  }

  // ─── activateTopUp ─────────────────────────────────────────────────────────
  // Called when a user purchases a top-up pack.

  async function activateTopUp(topUpId) {
    const topUp = TOP_UPS[topUpId]
    if (!topUp) return
    setSyncing(true)

    // ── Future: Stripe Checkout redirect ─────────────────────────────────────
    // const session = await fetch('/api/checkout/topup', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${localStorage.getItem('pp_session')}`,
    //   },
    //   body: JSON.stringify({ topUpId }),
    // }).then(r => r.json())
    // window.location.href = session.checkoutUrl  // Stripe redirect
    // ─────────────────────────────────────────────────────────────────────────

    // Simulate success for demo
    setState(s => addTopUpFn(s, topUp.credits))
    await new Promise(r => setTimeout(r, 500))
    setSyncing(false)
  }

  // ─── activateSubscription ──────────────────────────────────────────────────
  // Called when a user starts a subscription plan.

  async function activateSubscription(planId) {
    setSyncing(true)

    // ── Future: Stripe Subscription + DB sync ────────────────────────────────
    // const session = await fetch('/api/checkout/subscribe', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${localStorage.getItem('pp_session')}`,
    //   },
    //   body: JSON.stringify({ planId }),
    // }).then(r => r.json())
    // window.location.href = session.checkoutUrl
    //
    // ── Airtable / Supabase sync after Stripe webhook ────────────────────────
    // await fetch('/api/sync/subscription', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${localStorage.getItem('pp_session')}`,
    //   },
    //   body: JSON.stringify({ planId }),
    // })
    // ─────────────────────────────────────────────────────────────────────────

    setState(s => applySubscription(s, planId))
    await new Promise(r => setTimeout(r, 500))
    setSyncing(false)
  }

  // ─── redeemBurnerCode ──────────────────────────────────────────────────────
  // Server validates the code (one-time use, global) and tags the account.

  async function redeemBurnerCode(code) {
    setSyncing(true)
    try {
      const res = await fetch('/api/auth/redeem-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('pp_session')}`,
        },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSyncing(false)
        return { success: false, error: data.error }
      }
      setState(s => applySubscription(s, 'partner'))
      setSyncing(false)
      return { success: true }
    } catch {
      setSyncing(false)
      return { success: false, error: 'Failed to redeem code. Please try again.' }
    }
  }

  function dismissTouchGrass() { setShowTouchGrass(false) }

  return {
    state,
    syncing,
    showTouchGrass,
    dismissTouchGrass,
    displayCredits,
    affordable,
    consumeCredit,
    addCredits,
    activateTopUp,
    activateSubscription,
    redeemBurnerCode,
  }
}
