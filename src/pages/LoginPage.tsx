import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  KeyRound,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { apiRequest } from '../lib/api'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '../lib/security'
import { FinoraQRCode } from '../components/common/FinoraQRCode'
import { InteractiveDotsBackground } from '../components/common/InteractiveDotsBackground'
import { TiltCard } from '../components/common/TiltCard'
import type { User } from '../types'

interface QRGenerateResponse {
  qr_token: string
  expires_at: string
  expires_in: number
}

interface QRStatusResponse {
  status: 'pending' | 'confirmed' | 'expired'
  token?: string
  access_token?: string
  refresh_token?: string
  user?: User
  expires_in?: number
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, token, login, loginWithQr } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Auto-redirect to dashboard if already logged in
  useEffect(() => {
    if (token && user) {
      navigate('/', { replace: true })
    }
  }, [token, user, navigate])

  // Login mode: 'qr' | 'password'
  const [authMode, setAuthMode] = useState<'qr' | 'password'>('qr')

  // QR Auth State
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isQrExpired, setIsQrExpired] = useState(false)
  const [isQrSuccess, setIsQrSuccess] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)

  // Password Auth State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Generate new QR session
  const generateQr = async () => {
    setQrLoading(true)
    setIsQrExpired(false)
    setIsQrSuccess(false)
    setQrError(null)
    setTimeLeft(60)

    try {
      const res = await apiRequest<QRGenerateResponse>('/auth/qr/generate', {
        method: 'POST',
      })
      setQrToken(res.qr_token)
      setTimeLeft(res.expires_in || 60)
    } catch (err: any) {
      setQrError(err?.message || "QR kod yaratishda xatolik yuz berdi")
      setIsQrExpired(true)
    } finally {
      setQrLoading(false)
    }
  }

  // Load QR on mount if in QR mode
  useEffect(() => {
    if (authMode === 'qr') {
      generateQr()
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [authMode])

  // Countdown timer for QR
  useEffect(() => {
    if (authMode !== 'qr' || isQrExpired || isQrSuccess || !qrToken) return

    const cd = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsQrExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(cd)
  }, [authMode, isQrExpired, isQrSuccess, qrToken])

  // Poll QR status every 1.8 seconds
  useEffect(() => {
    if (authMode !== 'qr' || !qrToken || isQrExpired || isQrSuccess) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      return
    }

    const poll = async () => {
      try {
        const res = await apiRequest<QRStatusResponse>('/auth/qr/status', {
          params: { token: qrToken },
        })

        if (res.status === 'confirmed' && res.token && res.user) {
          const hasAccess = res.user.is_super_admin || res.user.permissions?.includes('admin_panel.access')
          if (!hasAccess) {
            setIsQrExpired(true)
            setQrError("Kechirasiz, ushbu hisobga Admin panelga kirish ruxsati berilmagan!")
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            return
          }

          setIsQrSuccess(true)
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

          setTimeout(() => {
            loginWithQr(res.access_token || res.token!, res.user!, res.refresh_token)
            navigate('/', { replace: true })
          }, 600)
        } else if (res.status === 'expired') {
          setIsQrExpired(true)
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      } catch {
        // network or server temporary error
      }
    }

    pollIntervalRef.current = setInterval(poll, 1800)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [authMode, qrToken, isQrExpired, isQrSuccess])

  // Brute-force cooldown protection
  const [cooldownSeconds, setCooldownSeconds] = useState(() => {
    const { remainingSeconds } = checkRateLimit('login_password')
    return remainingSeconds
  })

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  // Password login handler with rate limiting
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldownSeconds > 0) {
      setPasswordError(`Xavfsizlik blokirovkasi faol: Iltimos, ${cooldownSeconds} soniya kuting.`)
      return
    }

    setPasswordError(null)
    setPasswordLoading(true)

    try {
      await login(email.trim(), password)
      resetRateLimit('login_password')
      navigate('/', { replace: true })
    } catch (err: any) {
      const { isLocked, remainingSeconds, attempts } = recordFailedAttempt('login_password')
      if (isLocked) {
        setCooldownSeconds(remainingSeconds)
        setPasswordError(`Ko'p marta xato parol kiritildi (${attempts} ta). Xavfsizlik uchun tizim ${remainingSeconds} soniyaga bloklandi.`)
      } else {
        const remainingAttempts = 5 - attempts
        const attemptsWarning = remainingAttempts > 0 && remainingAttempts <= 3 
          ? ` (Qolgan urinishlar: ${remainingAttempts} ta)` 
          : ''
        setPasswordError((err?.message || "Tizimga kirishda xatolik yuz berdi") + attemptsWarning)
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const logoUrl = `${import.meta.env.BASE_URL}logo.png`

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-dark-bg dark:text-slate-100 transition-colors duration-300">
      {/* Interactive Physics Dot-Matrix Background */}
      <InteractiveDotsBackground />

      {/* Top Navbar */}
      <header className="relative z-10 flex h-16 w-full items-center justify-between px-5 sm:px-8 border-b border-slate-200/60 dark:border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xs">
            <img src={logoUrl} alt="Finora" className="h-full w-full object-cover" />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
            FINORA
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-xs backdrop-blur-md transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-dark-card/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Mavzuni almashtirish"
            aria-label="Mavzuni almashtirish"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 my-auto">
        <TiltCard className="w-full max-w-[420px]">
          {/* Minimalist Glass Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 backdrop-blur-xl dark:border-white/10 dark:bg-dark-card/90 transition-all">
            {/* Header: in QR mode, no big logo above */}
            <div className="text-center">
              {authMode === 'password' && (
                <div className="relative mx-auto inline-block mb-2">
                  <img
                    src={logoUrl}
                    alt="Finora"
                    className="h-11 w-11 rounded-xl object-cover border border-slate-200/90 dark:border-white/10 shadow-xs"
                  />
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Finora Admin Hub
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Boshqaruv va tahlillar tizimiga xavfsiz kirish
              </p>
            </div>

            {/* Segmented Tab Switcher without any "Tezkor" badge */}
            <div className="mt-6 flex rounded-2xl border border-slate-200/90 bg-slate-100/80 p-1 dark:border-white/5 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => setAuthMode('qr')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                  authMode === 'qr'
                    ? 'bg-white text-slate-950 shadow-xs dark:bg-dark-cardSecondary dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5 text-finora-600 dark:text-finora-400" />
                <span>QR Kod</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('password')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                  authMode === 'password'
                    ? 'bg-white text-slate-950 shadow-xs dark:bg-dark-cardSecondary dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Parol</span>
              </button>
            </div>

            {/* TAB 1: QR CODE AUTH */}
            {authMode === 'qr' && (
              <div className="mt-6 flex flex-col items-center animate-in fade-in duration-200">
                {/* Styled Rounded-Dot QR Code matching reference */}
                <FinoraQRCode
                  token={qrToken}
                  isLoading={qrLoading}
                  isExpired={isQrExpired}
                  isSuccess={isQrSuccess}
                  error={qrError}
                  timeLeft={timeLeft}
                  totalTime={60}
                  onRefresh={generateQr}
                  size={200}
                />

                {/* Minimalist 3-Step Scan Guide */}
                <div className="mt-5 w-full rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-[11.5px] text-slate-600 dark:border-white/5 dark:bg-slate-900/40 dark:text-slate-300 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-finora-500/20 text-[10px] font-black text-finora-800 dark:text-finora-300">
                      1
                    </span>
                    <span>Finora mobil ilovasini oching</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-finora-500/20 text-[10px] font-black text-finora-800 dark:text-finora-300">
                      2
                    </span>
                    <span className="truncate">
                      <strong>Profil</strong> &rarr; <strong>Admin panelga kirish</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-finora-500/20 text-[10px] font-black text-finora-800 dark:text-finora-300">
                      3
                    </span>
                    <span>Kodni skanerlab, <strong>Face ID</strong> bilan tasdiqlang</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PASSWORD AUTH */}
            {authMode === 'password' && (
              <div className="mt-6 animate-in fade-in duration-200">
                {/* Cooldown Alert */}
                {cooldownSeconds > 0 ? (
                  <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-bold">Xavfsizlik blokirovkasi faol</p>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        Xavfsizlik uchun tizim vaqtincha to'xtatildi. Qayta urinish: <strong>{cooldownSeconds} soniya</strong>
                      </p>
                    </div>
                  </div>
                ) : passwordError ? (
                  <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    <span className="font-medium leading-tight">{passwordError}</span>
                  </div>
                ) : null}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email manzil
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        disabled={cooldownSeconds > 0}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="admin@finora.uz"
                        required
                        autoFocus
                        className="w-full rounded-xl border border-slate-300/90 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/15 dark:border-white/10 dark:bg-slate-900/60 dark:text-white disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Parol
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        disabled={cooldownSeconds > 0}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-slate-300/90 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/15 dark:border-white/10 dark:bg-slate-900/60 dark:text-white disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        disabled={cooldownSeconds > 0}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-finora-600 focus:ring-finora-500/20 dark:border-white/10 dark:bg-slate-800"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Eslab qolish
                      </span>
                    </label>
                    <span className="text-[11px] font-semibold text-finora-600 dark:text-finora-400">
                      Faqat ma'murlar uchun
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading || cooldownSeconds > 0}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-finora-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-finora-500/25 transition-all hover:bg-finora-400 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        <span>Tekshirilmoqda...</span>
                      </div>
                    ) : cooldownSeconds > 0 ? (
                      <span>Bloklandi ({cooldownSeconds}s)</span>
                    ) : (
                      <>
                        <span>Tizimga kirish</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </TiltCard>
      </main>

      {/* Footer without extra text */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/40 dark:border-white/5">
        <span>Finora Financial OS &copy; 2026</span>
      </footer>
    </div>
  )
}
