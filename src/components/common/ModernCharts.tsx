import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'
import { formatCompactCurrency } from '../../lib/utils'
import { UserAvatar } from './UserAvatar'
import { Link } from 'react-router-dom'

// 1. Sparkline Mini Trend Chart
interface SparklineChartProps {
  data?: number[]
  color?: string
  height?: number
  width?: number | string
  isPositive?: boolean
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data = [],
  color,
  height = 36,
  width = 60,
  isPositive = true,
}) => {
  const chartColor = color || (isPositive ? '#10B981' : '#F43F5E')
  const safeData = Array.isArray(data) ? data : []
  const chartData = safeData.map((val, idx) => ({ idx, val: typeof val === 'number' && !isNaN(val) ? val : 0 }))
  const uniqueId = React.useId()
  const gradientId = `sparkline-grad-${uniqueId.replace(/:/g, '')}`
  const widthStyle = typeof width === 'number' ? `${width}px` : width

  return (
    <div style={{ height: `${height}px`, width: widthStyle }} className="shrink-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="val"
            stroke={chartColor}
            strokeWidth={1.8}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// 2. Dual Grouped Bar Chart ("Closed Won" style)
export interface MonthlyFlowItem {
  label: string
  income: number
  expense: number
  txCount?: number
}

interface GroupedBarChartProps {
  data?: MonthlyFlowItem[]
  title?: string
  subtitle?: string
  height?: number
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data = [],
  title = "Oylik moliyaviy oqim",
  subtitle = "Kirim va Chiqim balansi",
  height = 240,
}) => {
  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700 dark:bg-slate-300" />
            <span className="text-slate-600 dark:text-slate-300">Kirim</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">Chiqim</span>
          </div>
        </div>
      </div>

      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-dark-border" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickFormatter={(v) => formatCompactCurrency(v)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const inc = payload[0]?.value as number | undefined
                  const exp = payload[1]?.value as number | undefined
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-dark-border dark:bg-dark-card/95">
                      <p className="font-bold text-xs text-slate-900 dark:text-white mb-1.5">{label || ''}</p>
                      <div className="space-y-1 text-[11px]">
                        {inc !== undefined && (
                          <p className="flex items-center justify-between gap-4 text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-slate-700 dark:bg-slate-300" /> Kirim:
                            </span>
                            <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                              +{formatCompactCurrency(inc)}
                            </strong>
                          </p>
                        )}
                        {exp !== undefined && (
                          <p className="flex items-center justify-between gap-4 text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500" /> Chiqim:
                            </span>
                            <strong className="font-bold text-rose-600 dark:text-rose-400">
                              -{formatCompactCurrency(exp)}
                            </strong>
                          </p>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="income" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={14} className="dark:fill-slate-300" />
            <Bar dataKey="expense" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 3. Radar Chart ("Sales Capability" style)
export interface RadarItem {
  metric: string
  score: number
  benchmark: number
  fullMark?: number
}

interface EcosystemRadarProps {
  data?: RadarItem[]
  title?: string
  subtitle?: string
  height?: number
}

export const EcosystemRadarChart: React.FC<EcosystemRadarProps> = ({
  data = [],
  title = "Finora Ekotizim Tahlili",
  subtitle = "Funksiyalar va qamrov indeksi",
  height = 240,
}) => {
  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">Joriy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-300">Me'yor</span>
          </div>
        </div>
      </div>

      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={safeData}>
            <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-dark-border" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Joriy"
              dataKey="score"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.35}
            />
            <Radar
              name="Me'yor"
              dataKey="benchmark"
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={0.18}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0]?.payload
                  if (!item) return null
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm dark:border-dark-border dark:bg-dark-card/95 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">{item.metric || ''}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 mt-1">
                        Joriy: <strong>{item.score ?? 0}%</strong>
                      </p>
                      <p className="text-indigo-600 dark:text-indigo-400">
                        Me'yor: <strong>{item.benchmark ?? 0}%</strong>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 4. New Customers Bar Chart ("New Customers" style)
export interface CustomerGrowthItem {
  label: string
  count: number
}

interface NewCustomersBarProps {
  data?: CustomerGrowthItem[]
  height?: number
}

export const NewCustomersBarChart: React.FC<NewCustomersBarProps> = ({ data = [], height = 180 }) => {
  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Yangi foydalanuvchilar
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Oylik o'sish
        </span>
      </div>

      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-dark-border" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              dy={4}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const count = payload[0]?.value ?? 0
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm dark:border-dark-border dark:bg-dark-card/95 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{label}: </span>
                      <strong className="font-bold text-slate-900 dark:text-white">
                        +{count} ta foydalanuvchi
                      </strong>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={14} className="hover:opacity-85 dark:fill-slate-400" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 5. Account Engagement Donut Chart ("Account Engagement" style)
export interface DonutSlice {
  name: string
  value: number
  color: string
}

interface EngagementDonutProps {
  data?: DonutSlice[]
  title?: string
  subtitle?: string
  totalLabel?: string
  totalCount?: number
  height?: number
  showCurrency?: boolean
}

export const EngagementDonutChart: React.FC<EngagementDonutProps> = ({
  data = [],
  title = "Qurilmalar va Platformalar",
  subtitle = "Ulashuv ulushi",
  totalLabel = 'Jami',
  totalCount,
  height = 190,
  showCurrency = false,
}) => {
  const safeData = Array.isArray(data) ? data : []
  const total = totalCount ?? safeData.reduce((acc, cur) => acc + (cur?.value || 0), 0)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {subtitle}
        </span>
      </div>

      <div className="relative flex items-center justify-center" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              innerRadius={50}
              outerRadius={74}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {safeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0]?.payload
                  if (!item) return null
                  const val = item.value || 0
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0'
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm dark:border-dark-border dark:bg-dark-card/95 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">{item.name || ''}: </span>
                      <strong className="text-finora-700 dark:text-finora-400">
                        {showCurrency ? formatCompactCurrency(val) : `${val.toLocaleString()} ta`} ({pct}%)
                      </strong>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center counter badge */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {showCurrency ? formatCompactCurrency(total) : total.toLocaleString()}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Legend below */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
        {safeData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
            <span className="font-bold text-slate-900 dark:text-slate-200">
              {total > 0 && item?.value ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 6. Customer Satisfaction / Retention Gauge Chart ("Customer Satisfaction" style)
interface CustomerGaugeProps {
  score?: number
  title?: string
  subtitle?: string
  badgeLabel?: string
  breakdown?: Array<{
    category: string
    range: string
    proportion: string
    count: number | string
  }>
}

export const CustomerSatisfactionGauge: React.FC<CustomerGaugeProps> = ({
  score = 84.6,
  title = "Foydalanuvchilar Sodiqligi",
  subtitle = "Faollik va sodiqlik indeksi (NPS)",
  badgeLabel,
  breakdown = [],
}) => {
  const numScore = typeof score === 'number' && !isNaN(score) ? score : 84.6
  const clampedScore = Math.min(100, Math.max(0, numScore))
  const [animatedScore, setAnimatedScore] = React.useState(0)
  const safeBreakdown = Array.isArray(breakdown) ? breakdown : []
  const uniqueId = React.useId().replace(/:/g, '')
  const gradientId = `gauge-gradient-${uniqueId}`

  // Animate the needle & arc from 0 to target score smoothly
  React.useEffect(() => {
    let frameId: number
    let startTimestamp: number | null = null
    const duration = 850 // ms
    const targetScore = clampedScore

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)

      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(targetScore * ease)

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setAnimatedScore(targetScore)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [clampedScore])

  // Precise mathematical speedometer needle calculation (pure SVG coordinates, no CSS transform bugs)
  const cx = 110
  const cy = 110
  const needleLength = 56
  const tailLength = 10
  const baseWidth = 3.2

  const angleDeg = 180 - (animatedScore / 100) * 180
  const rad = (angleDeg * Math.PI) / 180
  const ux = Math.cos(rad)
  const uy = -Math.sin(rad)
  const vx = -Math.sin(rad)
  const vy = -Math.cos(rad)

  const tipX = cx + needleLength * ux
  const tipY = cy + needleLength * uy
  const rightX = cx + baseWidth * vx
  const rightY = cy + baseWidth * vy
  const tailX = cx - tailLength * ux
  const tailY = cy - tailLength * uy
  const leftX = cx - baseWidth * vx
  const leftY = cy - baseWidth * vy

  const needlePath = `M ${tipX.toFixed(2)} ${tipY.toFixed(2)} L ${rightX.toFixed(2)} ${rightY.toFixed(2)} L ${tailX.toFixed(2)} ${tailY.toFixed(2)} L ${leftX.toFixed(2)} ${leftY.toFixed(2)} Z`

  // Dynamic badge text and color based on score
  const badgeConfig = badgeLabel
    ? {
        text: badgeLabel,
        color:
          clampedScore >= 70
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
            : clampedScore >= 40
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
      }
    : clampedScore >= 70
    ? {
        text: 'Yuqori sodiqlik',
        color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      }
    : clampedScore >= 40
    ? {
        text: "O'rtacha faollik",
        color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
      }
    : {
        text: 'Past faollik',
        color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
      }

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      {/* Gauge SVG graphic - spacious headroom, overflow-visible */}
      <div className="relative my-2 flex flex-col items-center justify-center overflow-visible">
        <div className="relative flex items-center justify-center overflow-visible">
          <svg className="w-full max-w-[240px] h-[125px] overflow-visible select-none" viewBox="0 0 220 130">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <filter id={`needle-shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background Arc */}
            <path
              d="M 38 110 A 72 72 0 0 1 182 110"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="14"
              strokeLinecap="round"
              className="dark:stroke-slate-800"
            />

            {/* Gradient Progress Arc */}
            <path
              d="M 38 110 A 72 72 0 0 1 182 110"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="226.19"
              strokeDashoffset={226.19 - (animatedScore / 100) * 226.19}
            />

            {/* Speedometer Scale Ticks */}
            {[0, 25, 50, 75, 100].map(pct => {
              const tickRad = ((180 - pct * 1.8) * Math.PI) / 180
              const x1 = (110 + 60 * Math.cos(tickRad)).toFixed(1)
              const y1 = (110 - 60 * Math.sin(tickRad)).toFixed(1)
              const x2 = (110 + 64 * Math.cos(tickRad)).toFixed(1)
              const y2 = (110 - 64 * Math.sin(tickRad)).toFixed(1)
              return (
                <line
                  key={pct}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-slate-300 dark:text-slate-700"
                />
              )
            })}

            {/* Speedometer Needle (Pointer + Tail) */}
            <path
              d={needlePath}
              fill="#EF4444"
              filter={`url(#needle-shadow-${uniqueId})`}
            />

            {/* Center Pivot Hub */}
            <circle
              cx="110"
              cy="110"
              r="7"
              className="fill-slate-900 dark:fill-slate-100"
              stroke="#EF4444"
              strokeWidth="1.5"
            />
            <circle
              cx="110"
              cy="110"
              r="2.5"
              fill="#EF4444"
            />
          </svg>
        </div>

        <div className="mt-1 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {numScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">
              Ball
            </span>
          </div>
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold mt-0.5 ${badgeConfig.color}`}>
            {badgeConfig.text}
          </span>
        </div>
      </div>

      {/* Breakdown mini table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-dark-border/60">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-400 dark:bg-dark-cardSecondary/50 font-semibold">
            <tr>
              <th className="py-1.5 px-3">Guruh</th>
              <th className="py-1.5 px-2 text-right">Ulush</th>
              <th className="py-1.5 px-3 text-right">Soni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40 text-slate-600 dark:text-slate-300">
            {safeBreakdown.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-dark-cardSecondary/30">
                <td className="py-1.5 px-3 font-medium">
                  {row.category} <span className="text-[9.5px] text-slate-400">{row.range}</span>
                </td>
                <td className="py-1.5 px-2 text-right font-bold text-slate-900 dark:text-white">
                  {row.proportion}
                </td>
                <td className="py-1.5 px-3 text-right font-semibold text-slate-500">
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 7. Wave / Spline Area Chart ("Deals" style)
export interface CashflowWavePoint {
  date: string
  income: number
  expense: number
}

interface WaveAreaChartProps {
  data?: CashflowWavePoint[]
  height?: number
}

export const CashflowWaveAreaChart: React.FC<WaveAreaChartProps> = ({ data = [], height = 240 }) => {
  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Moliyaviy Aylanma To'lqini
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kunlik kassa oqimlari dinamikasi
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-800 dark:bg-slate-300" />
            <span className="text-slate-600 dark:text-slate-300">Kirim</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">Chiqim</span>
          </div>
        </div>
      </div>

      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={safeData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#334155" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#334155" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-dark-border" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickFormatter={(v) => formatCompactCurrency(v)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const inc = payload[0]?.value as number | undefined
                  const exp = payload[1]?.value as number | undefined
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-dark-border dark:bg-dark-card/95 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label || ''}</p>
                      <div className="space-y-1">
                        {inc !== undefined && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-500">Kirim:</span>
                            <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                              +{formatCompactCurrency(inc)}
                            </strong>
                          </div>
                        )}
                        {exp !== undefined && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-500">Chiqim:</span>
                            <strong className="font-bold text-amber-600 dark:text-amber-400">
                              -{formatCompactCurrency(exp)}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#334155"
              strokeWidth={2.4}
              fillOpacity={1}
              fill="url(#incomeWave)"
              className="dark:stroke-slate-300"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#F59E0B"
              strokeWidth={2.4}
              fillOpacity={1}
              fill="url(#expenseWave)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 8. Podium Ranking Card ("Sales Ranking" style)
export interface PodiumUser {
  id: number
  name: string
  email: string
  avatar?: string | null
  score: number | string
  rank: number
}

interface PodiumRankingProps {
  users?: PodiumUser[]
  title?: string
}

export const PodiumRanking: React.FC<PodiumRankingProps> = ({
  users = [],
  title = "Eng Faol Foydalanuvchilar",
}) => {
  const safeUsers = Array.isArray(users) ? users : []
  const top1 = safeUsers.find(u => u && u.rank === 1) || safeUsers[0]
  const top2 = safeUsers.find(u => u && u.rank === 2) || safeUsers[1]
  const top3 = safeUsers.find(u => u && u.rank === 3) || safeUsers[2]
  const others = safeUsers.filter(u => u && u.rank > 3).slice(0, 2)

  const formatFirstName = (name?: string | null) => {
    if (!name) return 'Foydalanuvchi'
    const clean = String(name).trim()
    return clean.split(' ')[0] || clean
  }

  const formatScore = (val: any) => {
    if (val === null || val === undefined) return '0 ta'
    if (typeof val === 'number') return `${val.toLocaleString()} ta`
    const str = String(val).trim()
    if (!str.includes('ta') && !str.includes("so'm") && !isNaN(Number(str))) {
      return `${Number(str).toLocaleString()} ta`
    }
    return str
  }

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kunlik amallar va faollik bo'yicha
          </p>
        </div>
        <Link
          to="/users"
          className="text-[11px] font-semibold text-finora-700 hover:underline dark:text-finora-400"
        >
          Barchasi →
        </Link>
      </div>

      {/* Podium (2nd, 1st, 3rd) */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-3 pb-4">
        {/* 2nd place */}
        {top2 && (
          <Link
            to={`/users/${top2.id}`}
            className="flex flex-col items-center group transition-transform hover:-translate-y-1"
          >
            <div className="relative">
              <div className="rounded-full p-0.5 ring-2 ring-slate-300 ring-offset-2 ring-offset-white dark:ring-offset-dark-card shadow-sm">
                <UserAvatar src={top2.avatar} name={top2.name} email={top2.email} size="md" shape="circle" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-800 shadow border-2 border-white dark:border-dark-card">
                2
              </span>
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[76px] text-center group-hover:text-finora-600">
              {formatFirstName(top2.name)}
            </span>
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
              {formatScore(top2.score)}
            </span>
          </Link>
        )}

        {/* 1st place (elevated) */}
        {top1 && (
          <Link
            to={`/users/${top1.id}`}
            className="flex flex-col items-center group transition-transform hover:-translate-y-1.5 -mt-3"
          >
            <div className="relative">
              <div className="rounded-full p-0.5 ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-dark-card shadow-md">
                <UserAvatar src={top1.avatar} name={top1.name} email={top1.email} size="lg" shape="circle" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-amber-950 shadow-md border-2 border-white dark:border-dark-card">
                👑
              </span>
            </div>
            <span className="mt-2 text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[88px] text-center group-hover:text-finora-600">
              {formatFirstName(top1.name)}
            </span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              {formatScore(top1.score)}
            </span>
          </Link>
        )}

        {/* 3rd place */}
        {top3 && (
          <Link
            to={`/users/${top3.id}`}
            className="flex flex-col items-center group transition-transform hover:-translate-y-1"
          >
            <div className="relative">
              <div className="rounded-full p-0.5 ring-2 ring-amber-700/60 ring-offset-2 ring-offset-white dark:ring-offset-dark-card shadow-sm">
                <UserAvatar src={top3.avatar} name={top3.name} email={top3.email} size="md" shape="circle" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-black text-white shadow border-2 border-white dark:border-dark-card">
                3
              </span>
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[76px] text-center group-hover:text-finora-600">
              {formatFirstName(top3.name)}
            </span>
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
              {formatScore(top3.score)}
            </span>
          </Link>
        )}
      </div>

      {/* Others (4th, 5th) */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-dark-border/60">
        {others.map((u, i) => (
          <Link
            key={u?.id || i}
            to={`/users/${u?.id}`}
            className="flex items-center justify-between rounded-xl px-2.5 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-dark-cardSecondary/60"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[11px] font-bold text-slate-400 w-3 text-center">{u?.rank || i + 4}</span>
              <UserAvatar src={u?.avatar} name={u?.name} email={u?.email} size="sm" shape="circle" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {u?.name || 'Foydalanuvchi'}
              </span>
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">
              {formatScore(u?.score)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

