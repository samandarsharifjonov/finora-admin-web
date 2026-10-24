import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Activity,
  Receipt,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  RefreshCw,
  Wallet,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type { AdminOverview } from '../types'
import { formatCompactCurrency } from '../lib/utils'
import { OverviewFlowChart } from '../components/common/SimpleCharts'

export const OverviewPage: React.FC = () => {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<AdminOverview>('/admin/overview')
      setData(res)
    } catch (err: any) {
      setError(err?.message || "Statistika ma'lumotlarini yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-finora-500 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Statistika yuklanmoqda...
          </span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
        <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
          {error || "Ma'lumot topilmadi"}
        </p>
        <button
          onClick={fetchOverview}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-finora-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-finora-700"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Qayta urinish
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Boshqaruv Paneli
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Ilovaning umumiy holati, foydalanuvchilar o'sishi va moliyaviy aylanmalari
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Yangilash
          </button>
          <Link
            to="/notifications"
            className="flex items-center gap-1.5 rounded-xl bg-finora-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-finora-600/30 transition-colors hover:bg-finora-700"
          >
            <Sparkles className="h-3.5 w-3.5" /> Xabarnoma yuborish
          </Link>
        </div>
      </div>

      {(() => {
        const totalUsers = data.total_users ?? 0
        const newToday = data.new_users_today ?? 0
        const newThisMonth = data.new_users_this_month ?? 0
        const dau = data.active_users_today ?? data.dau ?? 0
        const mau = data.active_users_this_month ?? data.mau ?? 0
        const retention = data.retention_rate_pct ?? (totalUsers > 0 ? (mau / totalUsers) * 100 : 0)
        const totalTx = data.total_transactions ?? 0
        const totalReceipts = data.total_receipts_scanned ?? data.total_receipts ?? 0
        const totalInc = data.total_income_all_time ?? data.total_income ?? 0
        const totalExp = data.total_expense_all_time ?? data.total_expense ?? 0
        const totalBal = data.total_balance ?? (totalInc - totalExp)
        const aiMsgCount = data.ai_message_count ?? 0
        const aiTxCount = data.ai_transaction_count ?? 0

        return (
          <>
            {/* Primary KPI Grid (4 cards) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Users */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Jami Foydalanuvchilar
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {totalUsers.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-0.5" /> +{newToday} bugun
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Shu oyda: <span className="font-semibold text-slate-700 dark:text-slate-200">+{newThisMonth} yangi</span>
                </div>
              </div>

              {/* DAU & MAU */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Faollik (DAU / MAU)
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {dau.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    / {mau.toLocaleString()} MAU
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Retention (saqlanish): <span className="font-bold text-finora-600 dark:text-finora-400">{retention.toFixed(1)}%</span>
                </div>
              </div>

              {/* Total Transactions */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Jami Tranzaksiyalar
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {totalTx.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">ta</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Soliq cheklari:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{totalReceipts} ta</span>
                </div>
              </div>

              {/* Overall System Balance */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Foydalanuvchilar Balansi
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {formatCompactCurrency(totalBal)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                    <ArrowDownRight className="h-3 w-3" /> {formatCompactCurrency(totalInc)}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3" /> {formatCompactCurrency(totalExp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Analytics Charts */}
            <OverviewFlowChart
              totalIncome={totalInc}
              totalExpense={totalExp}
              dau={dau}
              mau={mau}
              totalTx={totalTx}
            />

            {/* Finora AI & Social Matrix Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-finora-500/15 text-finora-700 dark:text-finora-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-slate-900 dark:text-white">
                      Finora AI Tizim Faolligi
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sun'iy intellekt orqali foydalanuvchilar bilan muloqot va kiritilgan xarajatlar
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-finora-500/10 px-3 py-1 text-xs font-bold text-finora-700 dark:bg-finora-950 dark:text-finora-400 border border-finora-500/20">
                  Aktiv
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/60 bg-white p-4 dark:border-dark-border/60 dark:bg-dark-cardSecondary">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <MessageSquare className="h-4 w-4 text-finora-500" />
                    <span>AI ga Yozilgan Xabarlar</span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {aiMsgCount.toLocaleString()}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Foydalanuvchilar tomonidan yozilgan jami savollar
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-white p-4 dark:border-dark-border/60 dark:bg-dark-cardSecondary">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>AI Tranzaksiyalari</span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {aiTxCount.toLocaleString()}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    AI ovoz/matn orqali avtomatik kiritilgan xarajatlar
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-white p-4 dark:border-dark-border/60 dark:bg-dark-cardSecondary">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Receipt className="h-4 w-4 text-purple-500" />
                    <span>Soliq OFD Cheklar</span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {totalReceipts.toLocaleString()}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    QR-kod orqali muvaffaqiyatli skanerlangan cheklar
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/users"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-finora-500/50 hover:shadow-md dark:border-dark-border dark:bg-dark-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Foydalanuvchilar
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Ro'yxat, qidiruv va profil tafsilotlari
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          to="/analytics"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-finora-500/50 hover:shadow-md dark:border-dark-border dark:bg-dark-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Chuqur Analitika
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Toifalar, qurilmalar va o'chirilgan akkauntlar
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          to="/notifications"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-finora-500/50 hover:shadow-md dark:border-dark-border dark:bg-dark-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Push Xabarnoma
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Barcha userlarga ommaviy xabar yuborish
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>
    </div>
  )
}
