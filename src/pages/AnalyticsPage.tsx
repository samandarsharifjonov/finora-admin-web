import React, { useEffect, useState } from 'react'
import {
  BarChart3,
  Smartphone,
  UserX,
  RefreshCw,
  Trash2,
  TrendingUp,
  TrendingDown,
  Layers,
  Cpu,
  Info,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type {
  CategoriesAnalyticsData,
  DevicesAnalyticsData,
  DeletionsAnalyticsData,
} from '../types'
import { formatCurrency, formatDate } from '../lib/utils'

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'devices' | 'deletions'>('categories')
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categoriesData, setCategoriesData] = useState<CategoriesAnalyticsData | null>(null)
  const [devicesData, setDevicesData] = useState<DevicesAnalyticsData | null>(null)
  const [deletionsData, setDeletionsData] = useState<DeletionsAnalyticsData | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [catsRes, devsRes, delsRes] = await Promise.allSettled([
        apiRequest<CategoriesAnalyticsData>('/admin/analytics/categories'),
        apiRequest<DevicesAnalyticsData>('/admin/analytics/devices'),
        apiRequest<DeletionsAnalyticsData>('/admin/analytics/deletions'),
      ])

      if (catsRes.status === 'fulfilled' && catsRes.value) {
        setCategoriesData(catsRes.value)
      }
      if (devsRes.status === 'fulfilled' && devsRes.value) {
        setDevicesData(devsRes.value)
      }
      if (delsRes.status === 'fulfilled' && delsRes.value) {
        setDeletionsData(delsRes.value)
      }
    } catch (err: any) {
      setError(err?.message || "Tahlillarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleClearDeletions = async () => {
    if (!confirm("Barcha hisob o'chirish qaydlarini tozalashni tasdiqlaysizmi?")) return
    try {
      await apiRequest('/admin/analytics/deletions', { method: 'DELETE' })
      setDeletionsData(prev => (prev ? { ...prev, recent_deletions: [], total_deleted: 0 } : null))
    } catch (err: any) {
      alert(err?.message || "O'chirishda xatolik")
    }
  }

  const handleDeleteSingleDeletion = async (id: number) => {
    if (!confirm("Ushbu qaydni o'chirishni tasdiqlaysizmi?")) return
    try {
      await apiRequest(`/admin/analytics/deletions/${id}`, { method: 'DELETE' })
      setDeletionsData(prev =>
        prev
          ? {
              ...prev,
              recent_deletions: prev.recent_deletions.filter(d => d.id !== id),
              total_deleted: Math.max(0, prev.total_deleted - 1),
            }
          : null
      )
    } catch (err: any) {
      alert(err?.message || "Qaydni o'chirishda xatolik")
    }
  }

  const expenseCategories = categoriesData?.top_expense_categories || []
  const incomeCategories = categoriesData?.top_income_categories || []
  const activeCategoriesList = categoryType === 'expense' ? expenseCategories : incomeCategories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Tizim Analitikasi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Toifalar sarfi, qurilmalar platformalari va o'chirilgan akkauntlar tahlili
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Yangilash
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-dark-border">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
            activeTab === 'categories'
              ? 'border-finora-500 text-finora-600 dark:border-finora-400 dark:text-finora-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Toifalar Tahlili (
          {expenseCategories.length + incomeCategories.length})
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
            activeTab === 'devices'
              ? 'border-finora-500 text-finora-600 dark:border-finora-400 dark:text-finora-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="h-4 w-4" /> Qurilmalar va Ilova (
          {devicesData?.total_active_devices ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('deletions')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
            activeTab === 'deletions'
              ? 'border-finora-500 text-finora-600 dark:border-finora-400 dark:text-finora-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <UserX className="h-4 w-4" /> O'chirilgan Akkauntlar (
          {deletionsData?.total_deleted ?? deletionsData?.recent_deletions?.length ?? 0})
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-finora-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20">
          {error}
        </div>
      ) : (
        <>
          {/* TAB 1: Categories Analytics */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              {/* Income / Expense filter tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCategoryType('expense')}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    categoryType === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300'
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5" /> Chiqim Toifalari ({expenseCategories.length})
                </button>
                <button
                  onClick={() => setCategoryType('income')}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    categoryType === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Kirim Toifalari ({incomeCategories.length})
                </button>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-3.5">Toifa nomi</th>
                        <th className="px-5 py-3.5 text-center">Foydalanuvchilar</th>
                        <th className="px-5 py-3.5 text-center">Tranzaksiyalar soni</th>
                        <th className="px-5 py-3.5 text-right">Ulushi (%)</th>
                        <th className="px-5 py-3.5 text-right">Jami Summa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60">
                      {activeCategoriesList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                            Toifalar ma'lumoti mavjud emas
                          </td>
                        </tr>
                      ) : (
                        activeCategoriesList.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-dark-cardSecondary/50">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
                                <span
                                  className="h-3 w-3 rounded-full shrink-0"
                                  style={{ backgroundColor: c.color || '#92DF4F' }}
                                />
                                <span>{c.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-center font-medium text-slate-600 dark:text-slate-300">
                              {c.user_count ?? '-'} ta
                            </td>
                            <td className="px-5 py-3.5 text-center font-semibold text-slate-600 dark:text-slate-300">
                              {c.transaction_count} ta
                            </td>
                            <td className="px-5 py-3.5 text-right font-medium text-slate-500 dark:text-slate-400">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-dark-cardSecondary overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      categoryType === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(3, c.percentage || 0))}%` }}
                                  />
                                </div>
                                <span>{(c.percentage || 0).toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                              {formatCurrency(c.total_amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Devices Analytics */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              {/* KPI Bar */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Jami Faol Qurilmalar
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {devicesData?.total_active_devices ?? 0} ta
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-finora-500/10 text-finora-600 dark:text-finora-400">
                  <Smartphone className="h-6 w-6" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Platform Breakdown */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="h-4 w-4 text-finora-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Operatsion Tizimlar (Platformalar)
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {(!devicesData?.platforms || devicesData.platforms.length === 0) ? (
                      <p className="text-center py-6 text-xs text-slate-400">
                        Platforma ma'lumoti mavjud emas
                      </p>
                    ) : (
                      devicesData.platforms.map((p, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-200 capitalize">
                              {p.platform || 'Noma\'lum'}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {p.count} ta ({(p.percentage || 0).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-dark-cardSecondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-finora-500 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(3, p.percentage || 0))}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Top App Versions */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-4 w-4 text-indigo-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Ilova Versiyalari Taqsimoti
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {(!devicesData?.top_app_versions || devicesData.top_app_versions.length === 0) ? (
                      <p className="text-center py-6 text-xs text-slate-400">
                        Ilova versiyasi ma'lumoti mavjud emas
                      </p>
                    ) : (
                      devicesData.top_app_versions.map((v, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-200 font-mono">
                              v{v.app_version || 'Noma\'lum'}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {v.count} ta ({(v.percentage || 0).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-dark-cardSecondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(3, v.percentage || 0))}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Top Device Models */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="h-4 w-4 text-emerald-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Eng Ko'p Ishlatilayotgan Qurilma Modellari
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(!devicesData?.top_devices || devicesData.top_devices.length === 0) ? (
                    <p className="col-span-full text-center py-6 text-xs text-slate-400">
                      Qurilma modellari ma'lumoti mavjud emas
                    </p>
                  ) : (
                    devicesData.top_devices.map((d, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200/70 p-3.5 bg-slate-50/50 dark:border-dark-border dark:bg-dark-cardSecondary/40 flex items-center justify-between"
                      >
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate pr-2">
                          {d.device_name}
                        </span>
                        <span className="rounded-md bg-finora-500/10 px-2 py-0.5 text-[11px] font-bold text-finora-600 dark:text-finora-400 shrink-0">
                          {d.count} ta
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Deletions Logs */}
          {activeTab === 'deletions' && (
            <div className="space-y-6">
              {/* Deletion KPIs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Jami O'chirilgan Akkauntlar
                    </span>
                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                      {deletionsData?.total_deleted ?? deletionsData?.recent_deletions?.length ?? 0} ta
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                    <UserX className="h-6 w-6" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Shu Oyda O'chirilganlar
                    </span>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                      {deletionsData?.deleted_this_month ?? 0} ta
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <Info className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Reasons breakdown */}
              {deletionsData?.reasons_breakdown && deletionsData.reasons_breakdown.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Ketish Sabablari Tahlili
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {deletionsData.reasons_breakdown.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200/70 p-3 bg-slate-50/50 dark:border-dark-border dark:bg-dark-cardSecondary/40"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {r.reason || "Ko'rsatilmagan"}
                          </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {r.count} ta ({(r.percentage || 0).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Deletions Table */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-dark-border">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    O'chirilgan Akkauntlar Tarixi ({deletionsData?.recent_deletions?.length || 0})
                  </div>
                  {deletionsData?.recent_deletions && deletionsData.recent_deletions.length > 0 && (
                    <button
                      onClick={handleClearDeletions}
                      className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" /> Tarixni tozalash
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-dark-border/60">
                  {(!deletionsData?.recent_deletions || deletionsData.recent_deletions.length === 0) ? (
                    <p className="py-8 text-center text-xs text-slate-400">
                      O'chirilgan akkauntlar qaydlari yo'q
                    </p>
                  ) : (
                    deletionsData.recent_deletions.map(d => (
                      <div key={d.id} className="p-4 text-xs hover:bg-slate-50/50 dark:hover:bg-dark-cardSecondary/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {d.full_name || d.email}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({d.email})
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-dark-cardSecondary dark:text-slate-400 uppercase">
                              {d.auth_provider}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">
                              {formatDate(d.deleted_at)}
                            </span>
                            <button
                              onClick={() => handleDeleteSingleDeletion(d.id)}
                              title="Qaydni o'chirish"
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-1.5 flex items-baseline gap-2">
                          <span className="font-semibold text-rose-600 dark:text-rose-400">Sababi:</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {d.reason || "Ko'rsatilmagan"}
                          </span>
                        </div>

                        {d.feedback && (
                          <div className="mt-2 rounded-lg bg-slate-50 p-2 text-slate-500 dark:bg-dark-cardSecondary/60 dark:text-slate-400 text-[11px]">
                            <span className="font-semibold">Foydalanuvchi fikri:</span> "{d.feedback}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
