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
  isPositive?: boolean
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data = [],
  color,
  height = 36,
  isPositive = true,
}) => {
  const chartColor = color || (isPositive ? '#10B981' : '#F43F5E')
  const safeData = Array.isArray(data) ? data : []
  const chartData = safeData.map((val, idx) => ({ idx, val: typeof val === 'number' && !isNaN(val) ? val : 0 }))
  const uniqueId = React.useId()
  const gradientId = `sparkline-grad-${uniqueId.replace(/:/g, '')}`

  return (
    <div style={{ height: `${height}px`, width: '84px' }} className="shrink-0 overflow-hidden">
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
  height?: number
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ data = [], height = 240 }) => {
  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Oylik moliyaviy oqim
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kirim va Chiqim balansi
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
  height?: number
}

export const EcosystemRadarChart: React.FC<EcosystemRadarProps> = ({ data = [], height = 240 }) => {
  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Finora Ekotizim Tahlili
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Funksiyalar va qamrov indeksi
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
  totalLabel?: string
  totalCount?: number
  height?: number
}

export const EngagementDonutChart: React.FC<EngagementDonutProps> = ({
  data = [],
  totalLabel = 'Jami',
  totalCount,
  height = 190,
}) => {
  const safeData = Array.isArray(data) ? data : []
  const total = totalCount ?? safeData.reduce((acc, cur) => acc + (cur?.value || 0), 0)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Qurilmalar va Platformalar
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Ulashuv ulushi
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
                      <strong className="text-finora-700 dark:text-finora-400">{val} ta ({pct}%)</strong>
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
            {total.toLocaleString()}
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
  breakdown?: Array<{
    category: string
    range: string
    proportion: string
    count: number
  }>
}

export const CustomerSatisfactionGauge: React.FC<CustomerGaugeProps> = ({
  score = 84.6,
  title = "Foydalanuvchilar Sodiqligi",
  breakdown = [],
}) => {
  const numScore = typeof score === 'number' && !isNaN(score) ? score : 84.6
  const clampedScore = Math.min(100, Math.max(0, numScore))
  const needleAngle = (clampedScore / 100) * 180 - 90
  const safeBreakdown = Array.isArray(breakdown) ? breakdown : []

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Faollik va sodiqlik indeksi (NPS)
        </p>
      </div>

      {/* Gauge SVG graphic */}
      <div className="relative my-3 flex flex-col items-center justify-center">
        <div className="relative h-28 w-52 overflow-hidden flex items-end justify-center">
          <svg className="h-48 w-48 -mb-4" viewBox="0 0 100 50">
            {/* Background Arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="11"
              strokeLinecap="round"
              className="dark:stroke-slate-800"
            />
            {/* Gradient Arc */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray="125.6"
              strokeDashoffset={125.6 - (clampedScore / 100) * 125.6}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Needle / indicator */}
          <div
            className="absolute bottom-0 h-14 w-1 bg-slate-800 dark:bg-white rounded-full origin-bottom transition-transform duration-700"
            style={{ transform: `rotate(${needleAngle}deg)` }}
          />
          <div className="absolute bottom-[-4px] h-3.5 w-3.5 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-dark-card" />
        </div>

        <div className="mt-2 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {numScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">
              Ball
            </span>
          </div>
          <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mt-0.5">
            Yuqori sodiqlik
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
    if (val === null || val === undefined) return '0'
    if (typeof val === 'number') return val.toLocaleString()
    return String(val)
  }

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
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
              <UserAvatar src={top2.avatar} name={top2.name} email={top2.email} size="md" />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[10px] font-black text-slate-800 shadow border-2 border-white dark:border-dark-card">
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
              <div className="rounded-full ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-dark-card">
                <UserAvatar src={top1.avatar} name={top1.name} email={top1.email} size="lg" />
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
              <UserAvatar src={top3.avatar} name={top3.name} email={top3.email} size="md" />
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
              <UserAvatar src={u?.avatar} name={u?.name} email={u?.email} size="sm" />
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

