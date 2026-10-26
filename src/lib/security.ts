/**
 * Finora Web Security Module
 * Enterprise-grade client-side protection:
 * 1. Anti-Brute-Force & Rate Limiting with cooldown timers
 * 2. Clickjacking & Frame-Busting defense
 * 3. Sensitive Data Console Shield
 */

interface RateLimitState {
  attempts: number
  lockedUntil: number
}

const STORAGE_PREFIX = 'finora_sec_rl_'

export function checkRateLimit(key: string): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!raw) return { isLocked: false, remainingSeconds: 0, attempts: 0 }

    const state: RateLimitState = JSON.parse(raw)
    const now = Date.now()

    if (state.lockedUntil && state.lockedUntil > now) {
      const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000)
      return { isLocked: true, remainingSeconds, attempts: state.attempts }
    }

    // Cooldown expired, but retain attempt counter until next successful login
    return { isLocked: false, remainingSeconds: 0, attempts: state.attempts }
  } catch (_) {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 }
  }
}

export function recordFailedAttempt(key: string): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`)
    let state: RateLimitState = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 }

    state.attempts += 1
    const now = Date.now()

    // 1-4 attempts: allowed
    // 5-7 attempts: lock for 60 seconds
    // 8+ attempts: lock for 300 seconds (5 minutes)
    if (state.attempts >= 8) {
      state.lockedUntil = now + 300 * 1000
    } else if (state.attempts >= 5) {
      state.lockedUntil = now + 60 * 1000
    }

    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(state))

    const isLocked = state.lockedUntil > now
    const remainingSeconds = isLocked ? Math.ceil((state.lockedUntil - now) / 1000) : 0

    return { isLocked, remainingSeconds, attempts: state.attempts }
  } catch (_) {
    return { isLocked: false, remainingSeconds: 0, attempts: 1 }
  }
}

export function resetRateLimit(key: string): void {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  } catch (_) {}
}

/**
 * Enforces Frame-Busting to prevent Clickjacking attacks
 */
export function enforceFrameBusting(): void {
  if (typeof window === 'undefined') return
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = window.self.location.href
    }
  } catch (_) {
    // If accessing window.top is blocked by cross-origin policy, break out completely
    document.body.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif;"><h3>Xavfsizlik ogohlantirishi</h3><p>Ushbu boshqaruv panelini iframe ichiga joylashtirish taqiqlangan (Clickjacking himoyasi).</p></div>'
  }
}

/**
 * Silences sensitive debug logs in production
 */
export function initProductionShield(): void {
  if (import.meta.env.PROD) {
    // Suppress console statements in production to prevent data leakage in DevTools
    console.log = () => {}
    console.debug = () => {}
    console.info = () => {}
  }
}
