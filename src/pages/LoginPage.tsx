import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  QrCode,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import type { User } from '../types'

interface QRGenerateResponse {
  qr_token: string
  expires_at: string
  expires_in: number
}

interface QRStatusResponse {
  status: 'pending' | 'confirmed' | 'expired'
  token?: string
  user?: User
  expires_in?: number
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, token, login, loginWithQr } = useAuth()

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
            loginWithQr(res.token!, res.user!)
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

  // Password login handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordLoading(true)

    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setPasswordError(err?.message || "Tizimga kirishda xatolik yuz berdi")
    } finally {
      setPasswordLoading(false)
    }
  }

  const logoUrl = `${import.meta.env.BASE_URL}logo.png`

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-dark-bg sm:p-6">
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-9">
          {/* Logo & Header */}
          <div className="text-center">
            <img
              src={logoUrl}
              alt="Finora"
              className="mx-auto h-14 w-14 rounded-2xl object-cover border border-slate-200/80 dark:border-dark-border"
            />
            <h1 className="mt-3.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Finora Admin Hub
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Boshqaruv va tahlillar tizimiga xavfsiz kirish
            </p>
          </div>

          {/* MODE 1: QR Code Login (Default & Recommended) */}
          {authMode === 'qr' && (
            <div className="mt-6">
              {qrError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span className="font-medium">{qrError}</span>
                </div>
              )}

              {/* QR Container */}
              <div className="relative mx-auto flex h-60 w-60 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-4 dark:border-dark-border">
                {isQrSuccess ? (
                  <div className="flex flex-col items-center justify-center py-6 text-emerald-600 dark:text-emerald-400 animate-in zoom-in duration-200">
                    <CheckCircle2 className="h-16 w-16" />
                    <span className="mt-3 text-xs font-bold">Tasdiqlandi!</span>
                  </div>
                ) : qrLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <RefreshCw className="h-7 w-7 animate-spin text-finora-500" />
                    <span className="text-[11px] font-medium">QR kod tayyorlanmoqda...</span>
                  </div>
                ) : qrToken && !isQrExpired ? (
                  <QRCodeSVG
                    value={`finora_qr:${qrToken}`}
                    size={208}
                    level="M"
                    includeMargin={false}
                  />
                ) : null}

                {/* Expired overlay */}
                {isQrExpired && !isQrSuccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-xs p-4 text-center dark:bg-dark-card/95">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      QR kod muddati tugadi
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Xavfsizlik uchun kod 60 soniyada eskiradi
                    </p>
                    <button
                      onClick={generateQr}
                      className="mt-3 flex items-center gap-1.5 rounded-xl bg-finora-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-finora-600"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Yangilash
                    </button>
                  </div>
                )}
              </div>

              {/* Countdown badge */}
              {!isQrExpired && !isQrSuccess && !qrLoading && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-finora-500" />
                  <span>
                    Muddati: <strong className="text-slate-900 dark:text-white">{timeLeft} soniya</strong>
                  </span>
                </div>
              )}

              {/* Step-by-step instructions */}
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-dark-border dark:bg-dark-cardSecondary/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-finora-500/20 text-[10px] font-bold text-finora-700 dark:text-finora-400">
                    1
                  </span>
                  <span>Finora mobil ilovasini oching</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-finora-500/20 text-[10px] font-bold text-finora-700 dark:text-finora-400">
                    2
                  </span>
                  <span>
                    <strong>Profil</strong> &rarr; <strong>Boshqaruv paneli</strong> &rarr; <strong>Admin panelga kirish</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-finora-500/20 text-[10px] font-bold text-finora-700 dark:text-finora-400">
                    3
                  </span>
                  <span>QR kodni skanerlab, Face ID yoki barmoq izi bilan tasdiqlang</span>
                </div>
              </div>

              {/* Switch to password login */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Lock className="h-3.5 w-3.5" /> Parol orqali kirish
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: Password Login (Backup fallback) */}
          {authMode === 'password' && (
            <div className="mt-6">
              {passwordError && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="flex-1 font-medium">{passwordError}</div>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email manzil
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@finora.uz"
                      required
                      autoFocus
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Parol
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-finora-600 focus:ring-finora-500/20 dark:border-dark-border dark:bg-dark-cardSecondary"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Eslab qolish
                    </span>
                  </label>
                  <span className="text-[11px] font-medium text-finora-600 hover:underline dark:text-finora-400">
                    Faqat Adminlar uchun
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-finora-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-finora-500/25 transition-all hover:bg-finora-600 active:scale-[0.99] disabled:opacity-60"
                >
                  {passwordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      <span>Tekshirilmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <span>Tizimga kirish</span>
                      <ArrowRight className="h-4 w-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch back to QR login */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('qr')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-finora-700 hover:underline dark:text-finora-400"
                >
                  <QrCode className="h-4 w-4" /> QR kod orqali tezkor kirish
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-8 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Finora Moliya Boshqaruv Tizimi &copy; 2026
          </div>
        </div>
      </div>
    </div>
  )
}
