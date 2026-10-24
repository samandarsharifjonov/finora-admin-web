import React, { useEffect, useState } from 'react'
import {
  BarChart3,
  Smartphone,
  UserX,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type {
  CategoryAnalyticsItem,
  DeviceAnalyticsItem,
  DeletionAnalyticsItem,
} from '../types'
import { formatCurrency, formatDate } from '../lib/utils'

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'devices' | 'deletions'>('categories')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<CategoryAnalyticsItem[]>([])
  const [devices, setDevices] = useState<DeviceAnalyticsItem[]>([])
  const [deletions, setDeletions] = useState<DeletionAnalyticsItem[]>([])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [catsRes, devsRes, delsRes] = await Promise.allSettled([
        apiRequest<CategoryAnalyticsItem[]>('/admin/analytics/categories'),
        apiRequest<DeviceAnalyticsItem[]>('/admin/analytics/devices'),
        apiRequest<DeletionAnalyticsItem[]>('/admin/analytics/deletions'),
      ])

      if (catsRes.status === 'fulfilled') setCategories(catsRes.value || [])
      if (devsRes.status === 'fulfilled') setDevices(devsRes.value || [])
      if (delsRes.status === 'fulfilled') setDeletions(delsRes.value || [])
    } catch (err: any) {
      setError(err?.message || "Tahlillarni yuklashda xatolik")
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
      setDeletions([])
    } catch (err: any) {
      alert(err?.message || "O'chirishda xatolik")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Tizim Analitikasi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Toifalar, qurilmalar turlari va foydalanuvchilar ketishi sabablari tahlili
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
              ? 'border-finora-600 text-finora-600 dark:border-finora-400 dark:text-finora-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Toifalar Tahlili ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
            activeTab === 'devices'
              ? 'border-finora-600 text-finora-600 dark:border-finora-400 dark:text-finora-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="h-4 w-4" /> Qurilmalar ({devices.length})
        </button>
        <button
          onClick={() => setActiveTab('deletions')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
            activeTab === 'deletions'
              ? 'border-finora-600 text-finora-600 dark:border-finora-400 dark:text-finora-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <UserX className="h-4 w-4" /> O'chirilgan Akkauntlar ({deletions.length})
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
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">Toifa</th>
                      <th className="px-5 py-3.5">Turi</th>
                      <th className="px-5 py-3.5 text-center">Foydalanishlar</th>
                      <th className="px-5 py-3.5 text-right">Umumiy Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                          Toifalar tahlili ma'lumoti topilmadi
                        </td>
                      </tr>
                    ) : (
                      categories.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-cardSecondary/50">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: c.color || '#8B5CF6' }}
                              />
                              <span>{c.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                c.type === 'income'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              }`}
                            >
                              {c.type === 'income' ? 'Kirim' : 'Chiqim'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-semibold text-slate-600 dark:text-slate-300">
                            {c.usage_count} ta
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
          )}

          {/* TAB 2: Devices Analytics */}
          {activeTab === 'devices' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                  Qurilma Platformalari Ulushi
                </h3>
                <div className="space-y-4">
                  {devices.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">
                      Qurilmalar ma'lumoti mavjud emas
                    </p>
                  ) : (
                    devices.map((d, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 dark:text-slate-200 capitalize">
                            {d.platform || 'Noma\'lum'}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {d.device_count} ta ({d.percentage?.toFixed(1) || 0}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-dark-cardSecondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-finora-500 to-indigo-600 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(2, d.percentage || 0))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Deletions Logs */}
          {activeTab === 'deletions' && (
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-dark-border">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  O'chirilgan Akkauntlar Tarixi ({deletions.length})
                </div>
                {deletions.length > 0 && (
                  <button
                    onClick={handleClearDeletions}
                    className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" /> Tarixni tozalash
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-dark-border/60">
                {deletions.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    O'chirilgan akkauntlar qaydlari yo'q
                  </p>
                ) : (
                  deletions.map(d => (
                    <div key={d.id} className="p-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {d.user_name || d.user_email}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(d.deleted_at)}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">Sababi:</span>{' '}
                        {d.reason || "Ko'rsatilmagan"}
                      </div>
                      {d.feedback && (
                        <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-500 dark:bg-dark-cardSecondary dark:text-slate-400 text-[11px]">
                          Fikr: "{d.feedback}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
