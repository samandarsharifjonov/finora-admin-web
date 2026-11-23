import React, { useState, useCallback, useMemo } from 'react'
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

function isFinder(r: number, c: number, n: number): boolean {
  if (r < 7 && c < 7) return true
  if (r < 7 && c >= n - 7) return true
  if (r >= n - 7 && c < 7) return true
  return false
}

function cellPath(x: number, y: number, rtl: number, rtr: number, rbr: number, rbl: number): string {
  let d = `M ${x + rtl} ${y} `
  d += `H ${x + 1 - rtr} `
  if (rtr > 0) d += `A ${rtr} ${rtr} 0 0 1 ${x + 1} ${y + rtr} `
  d += `V ${y + 1 - rbr} `
  if (rbr > 0) d += `A ${rbr} ${rbr} 0 0 1 ${x + 1 - rbr} ${y + 1} `
  d += `H ${x + rbl} `;
  if (rbl > 0) d += `A ${rbl} ${rbl} 0 0 1 ${x} ${y + 1 - rbl} `
  d += `V ${y + rtl} `
  if (rtl > 0) d += `A ${rtl} ${rtl} 0 0 1 ${x + rtl} ${y} `
  d += 'Z '
  return d
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
  size = 230,
  className = '',
}) => {
  const [matrixData, setMatrixData] = useState<{ matrix: boolean[][]; numCells: number } | null>(null)

  // Extract raw 2D module grid from hidden QRCodeSVG
  const hiddenSvgRef = useCallback((node: SVGSVGElement | null) => {
    if (!node) return
    const path = node.querySelector('path:nth-of-type(2)')
    const d = path?.getAttribute('d')
    const viewBox = node.getAttribute('viewBox')
    if (!d || !viewBox) return

    const match = viewBox.match(/0 0 (\d+) (\d+)/)
    if (!match) return
    const numCells = parseInt(match[1], 10)

    const matrix: boolean[][] = Array.from({ length: numCells }, () => Array(numCells).fill(false))
    const regex = /M(\d+)[,\s]+(\d+)\s*h(\d+)/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(d)) !== null) {
      const x = parseInt(m[1], 10)
      const y = parseInt(m[2], 10)
      const w = parseInt(m[3], 10)
      for (let i = 0; i < w; i++) {
        if (y < numCells && x + i < numCells) {
          matrix[y][x + i] = true
        }
      }
    }

    setMatrixData(prev => {
      if (prev && prev.numCells === numCells) {
        // Simple comparison to prevent redundant renders
        let same = true
        for (let r = 0; r < numCells; r++) {
          for (let c = 0; c < numCells; c++) {
            if (prev.matrix[r][c] !== matrix[r][c]) {
              same = false
              break
            }
          }
          if (!same) break
        }
        if (same) return prev
      }
      return { matrix, numCells }
    })
  }, [])

  // Generate styled rounded-dot path for data modules (matching reference image)
  const styledSvgData = useMemo(() => {
    if (!matrixData) return null
    const { matrix, numCells } = matrixData
    const R = 0.45
    let dataPaths = ''

    for (let r = 0; r < numCells; r++) {
      for (let c = 0; c < numCells; c++) {
        if (!matrix[r][c] || isFinder(r, c, numCells)) continue

        const top = r > 0 && matrix[r - 1][c] && !isFinder(r - 1, c, numCells)
        const bottom = r < numCells - 1 && matrix[r + 1][c] && !isFinder(r + 1, c, numCells)
        const left = c > 0 && matrix[r][c - 1] && !isFinder(r, c - 1, numCells)
        const right = c < numCells - 1 && matrix[r][c + 1] && !isFinder(r, c + 1, numCells)

        const rtl = !top && !left ? R : 0
        const rtr = !top && !right ? R : 0
        const rbr = !bottom && !right ? R : 0
        const rbl = !bottom && !left ? R : 0

        dataPaths += cellPath(c, r, rtl, rtr, rbr, rbl)
      }
    }

    const margin = 2
    const totalSize = numCells + margin * 2

    return { dataPaths, numCells, margin, totalSize }
  }, [matrixData])

  // Circular timer progress calculation (0 to 1)
  const progress = Math.max(0, Math.min(1, timeLeft / (totalTime || 60)))
  const radius = 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Hidden QRCodeSVG used purely for deterministic matrix calculation */}
      {token && (
        <div
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            opacity: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <QRCodeSVG
            ref={hiddenSvgRef}
            value={`finora_qr:${token}`}
            level="M"
            marginSize={0}
            size={128}
          />
        </div>
      )}

      {/* Styled White Card with Rounded Corners (matching uploaded reference image) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all dark:border-white/10 dark:bg-white">
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          {/* SUCCESS STATE */}
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-4 text-emerald-600 animate-in zoom-in-95 duration-300">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <span className="mt-2.5 text-xs font-bold tracking-wide text-emerald-700">
                Tasdiqlandi!
              </span>
              <span className="text-[11px] text-slate-500">Tizimga yo'naltirilmoqda...</span>
            </div>
          ) : isLoading || (!matrixData && token && !isExpired) ? (
            /* LOADING STATE */
            <div className="flex flex-col items-center justify-center gap-2.5 text-slate-400">
              <RefreshCw className="h-7 w-7 animate-spin text-finora-500" />
              <span className="text-[11px] font-medium text-slate-500">
                QR kod tayyorlanmoqda...
              </span>
            </div>
          ) : styledSvgData && token && !isExpired ? (
            /* STYLED ROUNDED-DOT QR CODE (EXACT MATCH TO REFERENCE IMAGE) */
            <svg
              viewBox={`0 0 ${styledSvgData.totalSize} ${styledSvgData.totalSize}`}
              width={size}
              height={size}
              className="block select-none"
              role="img"
              aria-label="Finora QR Code"
            >
              {/* Clean White Card Background with Rounded Corners */}
              <rect
                x="0"
                y="0"
                width={styledSvgData.totalSize}
                height={styledSvgData.totalSize}
                rx="3.5"
                ry="3.5"
                fill="#FFFFFF"
              />

              <g transform={`translate(${styledSvgData.margin}, ${styledSvgData.margin})`}>
                {/* Data modules with smooth rounded connected corners */}
                <path d={styledSvgData.dataPaths} fill="#000000" />

                {/* Finder Pattern: Top-Left */}
                <rect x="0" y="0" width="7" height="7" rx="2" ry="2" fill="#000000" />
                <rect x="1" y="1" width="5" height="5" rx="1.3" ry="1.3" fill="#FFFFFF" />
                <rect x="2" y="2" width="3" height="3" rx="0.9" ry="0.9" fill="#000000" />

                {/* Finder Pattern: Top-Right */}
                <rect
                  x={styledSvgData.numCells - 7}
                  y="0"
                  width="7"
                  height="7"
                  rx="2"
                  ry="2"
                  fill="#000000"
                />
                <rect
                  x={styledSvgData.numCells - 6}
                  y="1"
                  width="5"
                  height="5"
                  rx="1.3"
                  ry="1.3"
                  fill="#FFFFFF"
                />
                <rect
                  x={styledSvgData.numCells - 5}
                  y="2"
                  width="3"
                  height="3"
                  rx="0.9"
                  ry="0.9"
                  fill="#000000"
                />

                {/* Finder Pattern: Bottom-Left */}
                <rect
                  x="0"
                  y={styledSvgData.numCells - 7}
                  width="7"
                  height="7"
                  rx="2"
                  ry="2"
                  fill="#000000"
                />
                <rect
                  x="1"
                  y={styledSvgData.numCells - 6}
                  width="5"
                  height="5"
                  rx="1.3"
                  ry="1.3"
                  fill="#FFFFFF"
                />
                <rect
                  x="2"
                  y={styledSvgData.numCells - 5}
                  width="3"
                  height="3"
                  rx="0.9"
                  ry="0.9"
                  fill="#000000"
                />
              </g>
            </svg>
          ) : null}

          {/* EXPIRED OVERLAY */}
          {isExpired && !isSuccess && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-xs p-4 text-center animate-in fade-in duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">QR kod eskirgan</p>
              <p className="mt-0.5 text-[10.5px] text-slate-500 max-w-[170px]">
                Xavfsizlik maqsadida sessiya 60 soniyada yangilanadi
              </p>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-finora-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-finora-400 active:scale-95"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Yangilash</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Status & Circular Countdown Bar */}
      {!isExpired && !isSuccess && !isLoading && token && (
        <div className="mt-4 flex items-center justify-between w-full max-w-[220px] px-2.5 py-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 dark:border-white/10 dark:bg-slate-800/60 text-xs">
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
            <div className="relative flex h-5 w-5 items-center justify-center">
              <svg className="h-5 w-5 -rotate-90 transform">
                <circle
                  cx="10"
                  cy="10"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="10"
                  cy="10"
                  r={radius}
                  className="stroke-finora-500 transition-all duration-1000 ease-linear"
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[8.5px] font-bold text-slate-700 dark:text-slate-200">
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
