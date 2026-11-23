import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface FinoraQRCodeProps {
  token: string | null
  isLoading?: boolean
  isExpired?: boolean
  isSuccess?: boolean
  error?: string | null
  timeLeft?: number
  totalTime?: number
  onRefresh?: () => void
  size?: number
  className?: string
}

export const FinoraQRCode: React.FC<FinoraQRCodeProps> = ({
  token,
  isLoading = false,
  isExpired = false,
  isSuccess = false,
  error = null,
  timeLeft = 60,
  totalTime = 60,
  onRefresh,
  size = 208,
  className = '',
}) => {
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`
  const logoSize = Math.round(size * 0.22)

  // Circular timer progress calculation (0 to 1)
  const progress = Math.max(0, Math.min(1, timeLeft / (totalTime || 60)))
  const radius = 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Outer Glow & Glass Frame */}
      <div className="relative group">
        {/* Ambient background glow */}
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-finora-500/20 via-emerald-500/10 to-finora-400/20 blur-lg opacity-70 transition duration-500 group-hover:opacity-100" />

        {/* QR Core Container */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-2xl">
          {/* Scanner Viewfinder Brackets */}
          <div className="pointer-events-none absolute -top-1.5 -left-1.5 h-5 w-5 border-t-[2.5px] border-l-[2.5px] border-finora-500 rounded-tl-lg" />
          <div className="pointer-events-none absolute -top-1.5 -right-1.5 h-5 w-5 border-t-[2.5px] border-r-[2.5px] border-finora-500 rounded-tr-lg" />
          <div className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-5 w-5 border-b-[2.5px] border-l-[2.5px] border-finora-500 rounded-bl-lg" />
          <div className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-5 w-5 border-b-[2.5px] border-r-[2.5px] border-finora-500 rounded-br-lg" />

          {/* QR Inner Canvas Box */}
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-xl bg-white p-2"
            style={{ width: size + 16, height: size + 16 }}
          >
            {/* SUCCESS STATE */}
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-4 text-emerald-600 dark:text-emerald-500 animate-in zoom-in-95 duration-300">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100/80 dark:bg-emerald-950/60">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                  <CheckCircle2 className="relative h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="mt-3 text-xs font-bold tracking-wide uppercase text-emerald-700 dark:text-emerald-400">
                  Tasdiqlandi!
                </span>
                <span className="text-[11px] text-slate-500">Tizimga yo'naltirilmoqda...</span>
              </div>
            ) : isLoading ? (
              /* LOADING STATE */
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="relative flex h-12 w-12 items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-finora-500" />
                </div>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  QR kod tayyorlanmoqda...
                </span>
              </div>
            ) : token && !isExpired ? (
              /* ACTIVE QR CODE */
              <div className="relative flex items-center justify-center">
                <QRCodeSVG
                  value={`finora_qr:${token}`}
                  size={size}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#0F172A"
                  includeMargin={false}
                  imageSettings={{
                    src: logoUrl,
                    height: logoSize,
                    width: logoSize,
                    excavate: true,
                  }}
                />

                {/* Animated Futuristic Laser Scanline */}
                <div className="pointer-events-none absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-finora-500 to-transparent shadow-[0_0_10px_2px_rgba(146,223,79,0.8)] animate-qr-scan" />
              </div>
            ) : null}

            {/* EXPIRED OVERLAY */}
            {isExpired && !isSuccess && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/95 backdrop-blur-md p-4 text-center dark:bg-slate-900/95 animate-in fade-in duration-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <p className="mt-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  QR kod eskirgan
                </p>
                <p className="mt-0.5 text-[10.5px] text-slate-500 dark:text-slate-400 max-w-[170px]">
                  Xavfsizlik maqsadida sessiya 60 soniyada yangilanadi
                </p>
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-finora-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-finora-500/25 transition-all hover:bg-finora-400 active:scale-95"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Yangilash</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Status & Circular Countdown Bar */}
      {!isExpired && !isSuccess && !isLoading && token && (
        <div className="mt-4 flex items-center justify-between w-full max-w-[240px] px-2.5 py-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 dark:border-white/10 dark:bg-slate-800/60 text-xs">
          {/* Live pulsing status */}
          <div className="flex items-center gap-2 pl-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-finora-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-finora-500" />
            </span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Skanerlashga tayyor
            </span>
          </div>

          {/* Circular Countdown Progress */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex h-6 w-6 items-center justify-center">
              <svg className="h-6 w-6 -rotate-90 transform">
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  className="stroke-finora-500 transition-all duration-1000 ease-linear"
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[9px] font-bold text-slate-700 dark:text-slate-200">
                {timeLeft}
              </span>
            </div>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Kodni darhol yangilash"
                className="rounded-full p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message if any */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 max-w-[260px]">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span className="font-medium text-[11px] leading-tight">{error}</span>
        </div>
      )}
    </div>
  )
}
