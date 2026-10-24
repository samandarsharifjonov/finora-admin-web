import React, { useState } from 'react'
import { formatCompactCurrency } from '../../lib/utils'

interface BarItem {
  label: string
  income: number
  expense: number
  txCount?: number
}

interface MonthlyDynamicsChartProps {
  data: BarItem[]
  height?: number
}

export const MonthlyDynamicsChart: React.FC<MonthlyDynamicsChartProps> = ({
  data,
  height = 200,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-xs text-slate-400">
        Grafik ma'lumotlari mavjud emas
      </div>
    )
  }

  // Reverse if needed so oldest is left, newest is right
  const chartData = [...data].reverse()
  const maxVal = Math.max(
    ...chartData.map(d => Math.max(d.income || 0, d.expense || 0)),
    100000
  )

  const paddingBottom = 28
  const paddingTop = 16
  const usableHeight = height - paddingBottom - paddingTop

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 pb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span>Kirim</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
          <span>Chiqim</span>
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {/* Subtle grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7 pt-4">
          <div className="w-full border-b border-slate-100 dark:border-dark-border/40" />
          <div className="w-full border-b border-slate-100 dark:border-dark-border/40" />
          <div className="w-full border-b border-slate-200 dark:border-dark-border" />
        </div>

        {/* Bars container */}
        <div className="absolute inset-0 flex items-end justify-around pb-7 pt-4 px-2">
          {chartData.map((item, idx) => {
            const incHeight = Math.max(4, ((item.income || 0) / maxVal) * usableHeight)
            const expHeight = Math.max(4, ((item.expense || 0) / maxVal) * usableHeight)
            const isHovered = hoveredIndex === idx

            return (
              <div
                key={idx}
                className="relative flex flex-col items-center group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-16 z-20 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] shadow-sm dark:border-dark-border dark:bg-dark-card">
                    <p className="font-bold text-slate-900 dark:text-white mb-0.5">{item.label}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        +{formatCompactCurrency(item.income)}
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        -{formatCompactCurrency(item.expense)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bars Pair */}
                <div className="flex items-end gap-1.5 px-2">
                  <div
                    className="w-3.5 sm:w-5 rounded-t-sm bg-emerald-500 transition-all duration-300 hover:opacity-90"
                    style={{ height: `${incHeight}px` }}
                  />
                  <div
                    className="w-3.5 sm:w-5 rounded-t-sm bg-rose-500 transition-all duration-300 hover:opacity-90"
                    style={{ height: `${expHeight}px` }}
                  />
                </div>

                {/* X-axis Label */}
                <span className="absolute -bottom-6 text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface OverviewFlowChartProps {
  totalIncome: number
  totalExpense: number
  dau: number
  mau: number
  totalTx: number
}

export const OverviewFlowChart: React.FC<OverviewFlowChartProps> = ({
  totalIncome,
  totalExpense,
  dau,
  mau,
  totalTx,
}) => {
  const total = (totalIncome + totalExpense) || 1
  const incomePct = ((totalIncome / total) * 100).toFixed(1)
  const expensePct = ((totalExpense / total) * 100).toFixed(1)
  const dauPct = mau > 0 ? Math.min(100, (dau / mau) * 100).toFixed(1) : '0'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Cashflow Balance Comparison */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-slate-900 dark:text-white">
            Moliyaviy oqim
          </span>
          <span className="text-slate-400 text-[11px]">Jami aylanma</span>
        </div>

        {/* Progress ratio bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-dark-cardSecondary overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${incomePct}%` }}
            title={`Kirim: ${incomePct}%`}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${expensePct}%` }}
            title={`Chiqim: ${expensePct}%`}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">
              Kirim: <strong className="text-slate-900 dark:text-white">{incomePct}%</strong> ({formatCompactCurrency(totalIncome)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-300">
              Chiqim: <strong className="text-slate-900 dark:text-white">{expensePct}%</strong> ({formatCompactCurrency(totalExpense)})
            </span>
          </div>
        </div>
      </div>

      {/* 2. User Engagement Rate */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-slate-900 dark:text-white">
            Kunlik faollik
          </span>
          <span className="font-semibold text-finora-700 dark:text-finora-400">
            {dauPct}% faol
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-dark-cardSecondary overflow-hidden">
          <div
            className="h-full bg-finora-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(2, Number(dauPct)))}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Bugun: <strong className="text-slate-900 dark:text-white">{dau.toLocaleString()} ta</strong></span>
          <span>Oyda: <strong className="text-slate-900 dark:text-white">{mau.toLocaleString()} ta</strong></span>
          <span>Amallar: <strong className="text-slate-900 dark:text-white">{totalTx.toLocaleString()} ta</strong></span>
        </div>
      </div>
    </div>
  )
}
