import React, { useEffect, useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Lock, RefreshCw, LogOut, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 daqiqa (millisekundda)

export const AutoLockOverlay: React.FC = () => {
  const { user, logout, login } = useAuth()
  const [isLocked, setIsLocked] = useState(false)
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isExpired, setIsExpired] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Password unlock state
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Reset activity timer
  const resetTimer = () => {
    lastActivityRef.current = Date.now()
    if (isLocked) return // Don't reset if already locked
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      lockScreen()
    }, INACTIVITY_TIMEOUT)
  }

  const lockScreen = () => {
    setIsLocked(true)
    setShowPasswordInput(false)
    setPassword('')
    setPasswordError(null)
    generateQr()
  }

  // Generate QR session for unlocking
  const generateQr = async () => {
    try {
      setIsExpired(false)
      setIsSuccess(false)
      setTimeLeft(60)
      const res = await apiRequest<{ qr_token: string; expires_in: number }>('/auth/qr/generate', {
        method: 'POST',
      })
      setQrToken(res.qr_token)
    } catch {
      setIsExpired(true)
    }
  }

  // Activity event listeners & tab visibility handling
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    const handler = () => resetTimer()

    const onVisibilityOrFocusChange = () => {
      if (isLocked) return
      const elapsed = Date.now() - lastActivityRef.current
      if (elapsed >= INACTIVITY_TIMEOUT) {
        lockScreen()
      } else {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          lockScreen()
        }, Math.max(0, INACTIVITY_TIMEOUT - elapsed))
      }
    }

    events.forEach(evt => window.addEventListener(evt, handler, { passive: true }))
    document.addEventListener('visibilitychange', onVisibilityOrFocusChange)
    window.addEventListener('focus', onVisibilityOrFocusChange)

    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(evt => window.removeEventListener(evt, handler))
      document.removeEventListener('visibilitychange', onVisibilityOrFocusChange)
      window.removeEventListener('focus', onVisibilityOrFocusChange)
    }
  }, [isLocked])

  // Countdown timer when locked
  useEffect(() => {
    if (!isLocked || isExpired || isSuccess) return

    const cd = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(cd)
  }, [isLocked, isExpired, isSuccess, qrToken])

  // Polling for QR status when locked
  useEffect(() => {
    if (!isLocked || !qrToken || isExpired || isSuccess) return

    const poll = async () => {
      try {
        const res = await apiRequest<{ status: string }>('/auth/qr/status', {
          params: { token: qrToken },
        })

        if (res.status === 'confirmed') {
          setIsSuccess(true)
          setTimeout(() => {
            setIsLocked(false)
            setIsSuccess(false)
            setQrToken(null)
            resetTimer()
          }, 800)
        } else if (res.status === 'expired') {
          setIsExpired(true)
        }
      } catch {
        // network or server error
      }
    }

    pollIntervalRef.current = setInterval(poll, 1800)
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [isLocked, qrToken, isExpired, isSuccess])

  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || !user?.email) return
    setIsUnlocking(true)
    setPasswordError(null)

    try {
      await login(user.email, password)
      setIsLocked(false)
      setPassword('')
      resetTimer()
    } catch (err: any) {
      setPasswordError(err?.message || "Parol noto'g'ri kiritildi")
    } finally {
      setIsUnlocking(false)
    }
  }

  if (!isLocked) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-dark-border dark:bg-dark-card/95 sm:p-8 text-center">
        {/* Lock icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-finora-500/15 border border-finora-500/30 text-finora-600 dark:text-finora-400">
          <Lock className="h-7 w-7" />
        </div>

        <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">
          Finora Web qulflangan
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Kompyuter faolsiz qolgani sababli xavfsizlik uchun qulflanildi
        </p>

        {isSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center py-6 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-16 w-16 animate-bounce" />
            <span className="mt-3 text-sm font-bold">Muvaffaqiyatli ochildi!</span>
          </div>
        ) : !showPasswordInput ? (
          /* QR Unlock Mode */
          <div className="mt-5 space-y-4">
            <div className="relative mx-auto flex h-52 w-52 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-inner dark:border-dark-border">
              {qrToken && !isExpired ? (
                <QRCodeSVG
                  value={`finora_qr:${qrToken}`}
                  size={184}
                  level="M"
                  includeMargin={false}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-4 text-slate-400">
                  <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                  <span className="text-xs">Yuklanmoqda...</span>
                </div>
              )}

              {/* Expired overlay */}
              {isExpired && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-xs p-4 dark:bg-dark-card/95">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    QR kod muddati tugadi
                  </p>
                  <button
                    onClick={generateQr}
                    className="mt-3 flex items-center gap-1.5 rounded-xl bg-finora-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm hover:bg-finora-600"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Yangilash
                  </button>
                </div>
              )}
            </div>

            {/* Countdown timer */}
            {!isExpired && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-finora-500" />
                <span>
                  Finora mobil ilovasida skanerlang (<strong className="text-slate-900 dark:text-white">{timeLeft}s</strong>)
                </span>
              </div>
            )}

            {/* Switch to password */}
            <button
              onClick={() => setShowPasswordInput(true)}
              className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-finora-600 hover:underline dark:text-finora-400 mx-auto"
            >
              <KeyRound className="h-3.5 w-3.5" /> Parol bilan ochish
            </button>
          </div>
        ) : (
          /* Password Unlock Mode */
          <form onSubmit={handlePasswordUnlock} className="mt-5 space-y-3.5 text-left">
            {passwordError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {passwordError}
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Admin paroli
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-finora-500 focus:bg-white dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isUnlocking}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-finora-500 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:bg-finora-600 disabled:opacity-60"
            >
              {isUnlocking ? 'Tekshirilmoqda...' : 'Ekranni ochish'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPasswordInput(false)
                generateQr()
              }}
              className="block w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pt-1"
            >
              QR kod orqali ochish
            </button>
          </form>
        )}

        {/* Logout button */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-dark-border">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 mx-auto"
          >
            <LogOut className="h-3.5 w-3.5" /> Butunlay tizimdan chiqish
          </button>
        </div>
      </div>
    </div>
  )
}
