// ─── Plan Registry ────────────────────────────────────────────────────────────
// internalCap values are NEVER exposed to subscribers in the UI.
// Subscribers see "Status: Optimal" until they breach 90% of their cap.

export const PLANS = {
  free: {
    id:       'free',
    label:    'Free',
    type:     'daily',
    dailyCap: 10,
  },
  tier1: {
    id:          'tier1',
    label:       'Probably Never Run Out',
    type:        'subscription',
    price:       '£4.99/mo',
    internalCap: 1000,  // opaque — never shown unless > 90% consumed
  },
  tier2: {
    id:          'tier2',
    label:       'Definitely Never Run Out',
    type:        'subscription',
    price:       '£14.99/mo',
    internalCap: 10000, // opaque
  },
  partner: {
    id:           'partner',
    label:        'Partner Access',
    type:         'subscription',
    internalCap:  10000,
    partnerAccess: true,
  },
}

// ─── Top-Up Registry ──────────────────────────────────────────────────────────
// Top-up credits carry over (not daily-reset). Consumed after subscription bucket.

export const TOP_UPS = {
  snack: { id: 'snack', label: 'The Snack', price: '£2.50', credits: 50  },
  pack:  { id: 'pack',  label: 'The Pack',  price: '£5',   credits: 100 },
}

// ─── Burner Code Registry ─────────────────────────────────────────────────────
// Server validates one-time use. Client uses this list for instant UX feedback.

export const BURNER_CODES = ['lee unlimited', 'josh unlimited', 'dan unlimited']

export function isBurnerCode(code) {
  return BURNER_CODES.includes(code.toLowerCase().trim())
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function getTodayKey() {
  return new Date().toDateString()
}

export function shouldResetDaily(lastResetDate) {
  return lastResetDate !== getTodayKey()
}

// ─── Initial State ────────────────────────────────────────────────────────────

export function getInitialCreditState() {
  return {
    plan:                 'free',
    subscriptionCredits:  0,              // subscription bucket — resets on billing cycle
    topUpCredits:         0,              // carry-over bucket (top-ups + referrals)
    freeCredits:          PLANS.free.dailyCap,  // daily free allowance
    lastResetDate:        getTodayKey(),
    partnerAccess:        false,
    auditLog:             [],             // in-memory only — never persisted
  }
}

// ─── State Transitions (pure functions) ──────────────────────────────────────

/**
 * Reset free credits if it is a new calendar day.
 */
export function applyDailyReset(state) {
  if (shouldResetDaily(state.lastResetDate)) {
    return { ...state, freeCredits: PLANS.free.dailyCap, lastResetDate: getTodayKey() }
  }
  return state
}

/**
 * Returns true when the user has at least one credit in any bucket.
 */
export function canAfford(state) {
  return state.subscriptionCredits > 0 || state.freeCredits > 0 || state.topUpCredits > 0
}

/**
 * Deduct 1 credit.
 * Priority: subscription → free daily → top-up (preserves carry-over credits longest).
 */
export function consume(state) {
  if (state.subscriptionCredits > 0) return { ...state, subscriptionCredits: state.subscriptionCredits - 1 }
  if (state.freeCredits > 0)         return { ...state, freeCredits: state.freeCredits - 1 }
  if (state.topUpCredits > 0)        return { ...state, topUpCredits: state.topUpCredits - 1 }
  return state // hard cap — caller must check canAfford first
}

/**
 * Add to the carry-over top-up bucket (purchases, referral bonuses, etc.).
 */
export function addTopUpCredits(state, amount) {
  return { ...state, topUpCredits: state.topUpCredits + amount }
}

/**
 * Apply a subscription plan — fills the subscription bucket to the plan's internal cap.
 */
export function applySubscription(state, planId) {
  const plan = PLANS[planId]
  if (!plan || plan.type !== 'subscription') return state
  return {
    ...state,
    plan:                planId,
    subscriptionCredits: plan.internalCap,
    partnerAccess:       !!plan.partnerAccess,
  }
}

// ─── Display Helpers ─────────────────────────────────────────────────────────

/**
 * Compute what the credits counter should show.
 *
 * Subscribers:
 *   < 90% consumed → opaque: "Status: Optimal" / "Plan: Partner Access"
 *   ≥ 90% consumed → reveal numbers + warning flag
 *
 * Free / top-up users:
 *   Always show "Credits: X / Y"
 */
export function getDisplayCredits(state) {
  const plan = PLANS[state.plan]

  if (plan.type === 'subscription') {
    const used    = plan.internalCap - state.subscriptionCredits
    const pctUsed = used / plan.internalCap

    if (pctUsed < 0.9) {
      return {
        opaque:    true,
        label:     state.plan === 'partner' ? 'Plan: Partner Access' : 'Status: Optimal',
        planLabel: plan.label,
        warning:   false,
      }
    }

    return {
      opaque:  false,
      label:   `Prompts: ${state.subscriptionCredits} / ${plan.internalCap}`,
      current: state.subscriptionCredits,
      cap:     plan.internalCap,
      warning: true,
    }
  }

  // Free tier + top-ups
  const total      = state.freeCredits + state.topUpCredits
  const displayCap = PLANS.free.dailyCap + state.topUpCredits

  return {
    opaque:  false,
    label:   `Prompts: ${total} / ${displayCap}`,
    current: total,
    cap:     displayCap,
    warning: total === 0,
  }
}

// ─── Audit Helpers ────────────────────────────────────────────────────────────

/**
 * Build an audit entry for every prompt generation.
 * Logged client-side immediately; synced to server when backend is wired.
 */
export function createAuditEntry(userId, tier, reason = 'prompt_generation') {
  return {
    userId:    userId ?? 'anonymous',
    tier,
    reason,
    timestamp: Date.now(),
    date:      new Date().toISOString(),
  }
}
