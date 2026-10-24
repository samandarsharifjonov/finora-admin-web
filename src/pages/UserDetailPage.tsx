import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Users as FriendsIcon,
  MessageSquare,
  Clock,
  Smartphone,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Ban,
  CheckCircle,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type { AdminUserDetail } from '../types'
import { formatCurrency, formatDate } from '../lib/utils'
import { UserAvatar } from '../components/common/UserAvatar'
import { MonthlyDynamicsChart } from '../components/common/SimpleCharts'

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Block modal
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUserDetail = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<AdminUserDetail>(`/admin/users/${id}`)
      setUser(res)
    } catch (err: any) {
      setError(err?.message || "Foydalanuvchi ma'lumotlarini yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDetail()
  }, [id])

  const handleBlockUser = async () => {
    if (!user) return
    const targetId = user.user_id ?? user.id
    setActionLoading(true)
    try {
      await apiRequest(`/admin/users/${targetId}/block`, {
        method: 'POST',
        body: JSON.stringify({ reason: blockReason.trim() || 'Qoidabuzarlik sababli' }),
      })
      setShowBlockModal(false)
      setBlockReason('')
      fetchUserDetail()
    } catch (err: any) {
      alert(err?.message || "Bloklashda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblockUser = async () => {
    if (!user) return
    if (!confirm('Ushbu foydalanuvchini blokdan chiqarmoqchimisiz?')) return
    const targetId = user.user_id ?? user.id
    setActionLoading(true)
    try {
      await apiRequest(`/admin/users/${targetId}/unblock`, { method: 'POST' })
      fetchUserDetail()
    } catch (err: any) {
      alert(err?.message || "Blokdan chiqarishda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!user) return
    const confirmation = prompt(`Diqqat! Foydalanuvchini butunlay o'chirish uchun '${user.email}' deb yozing:`)
    if (confirmation !== user.email) {
      if (confirmation !== null) alert("Email noto'g'ri kiritildi. O'chirish bekor qilindi.")
      return
    }

    const targetId = user.user_id ?? user.id
    setActionLoading(true)
    try {
      await apiRequest(`/admin/users/${targetId}`, { method: 'DELETE' })
      alert("Foydalanuvchi butunlay o'chirildi")
      navigate('/users', { replace: true })
    } catch (err: any) {
      alert(err?.message || "Foydalanuvchini o'chirishda xatolik")
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-finora-500 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Foydalanuvchi ma'lumotlari yuklanmoqda...
          </span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
        <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
          {error || "Foydalanuvchi topilmadi"}
        </p>
        <Link
          to="/users"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-finora-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-finora-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Foydalanuvchilar ro'yxatiga qaytish
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top bar with back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Foydalanuvchilar ro'yxatiga qaytish
        </Link>

        <button
          onClick={fetchUserDetail}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Yangilash
        </button>
      </div>

      {/* User Header Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={user.avatar_url}
              name={user.full_name}
              email={user.email}
              size="xl"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                  {user.full_name || 'Noma\'lum'}
                </h1>
                {user.is_super_admin && (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                    SUPER ADMIN
                  </span>
                )}
                {user.is_admin && !user.is_super_admin && (
                  <span className="rounded-md bg-finora-100 px-2 py-0.5 text-xs font-bold text-finora-700 dark:bg-finora-950 dark:text-finora-300">
                    ADMIN
                  </span>
                )}
                {user.is_protected && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Shield className="h-3 w-3" /> Himoyalangan
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {user.email} &bull; Ro'yxatdan o'tgan: {formatDate(user.created_at)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {user.is_blocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                    <Ban className="h-3 w-3" /> Bloklangan: {user.blocked_reason || 'Sababsiz'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CheckCircle className="h-3 w-3" /> Faol
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {!user.is_super_admin && (
            <div className="flex flex-wrap items-center gap-2">
              {user.is_blocked ? (
                <button
                  disabled={actionLoading}
                  onClick={handleUnblockUser}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <Unlock className="h-3.5 w-3.5" /> Blokdan chiqarish
                </button>
              ) : (
                <button
                  disabled={actionLoading}
                  onClick={() => setShowBlockModal(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <Lock className="h-3.5 w-3.5" /> Bloklash
                </button>
              )}

              <button
                disabled={actionLoading}
                onClick={handleDeleteUser}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-dark-cardSecondary dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" /> Akkauntni o'chirish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Financial Matrix (3 Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Joriy Balans</span>
            <Wallet className="h-4 w-4 text-finora-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(user.balance ?? 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Hamyonlar va kartalar bo'yicha
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Jami Kirim</span>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(user.total_income ?? 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Barcha tushumlar summasi
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Jami Chiqim</span>
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(user.total_expense ?? 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Xarajatlar ({user.transaction_count ?? 0} ta tranzaksiya)
          </div>
        </div>
      </div>

      {/* Finora AI & Social Section (2x2 Matrix matching mobile admin!) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-dark-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-finora-100 text-finora-600 dark:bg-finora-950 dark:text-finora-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Finora AI va Ijtimoiy Faollik
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. AI Messages */}
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-dark-border/60 dark:bg-dark-cardSecondary">
            <div className="flex items-center gap-2 text-xs font-semibold text-finora-600 dark:text-finora-400">
              <MessageSquare className="h-4 w-4" />
              <span>AI Xabarlar</span>
            </div>
            <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {user.ai_message_count ?? 0} ta
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Jami AI ga yozilgan savollar
            </p>
          </div>

          {/* 2. AI Transactions */}
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-dark-border/60 dark:bg-dark-cardSecondary">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
              <span>AI Xarajatlar</span>
            </div>
            <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {user.ai_transaction_count ?? 0} ta
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              AI orqali kiritilgan tranzaksiyalar
            </p>
          </div>

          {/* 3. Confirmed Friends */}
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-dark-border/60 dark:bg-dark-cardSecondary">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <FriendsIcon className="h-4 w-4" />
              <span>Do'stlari Soni</span>
            </div>
            <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {user.friend_count ?? 0} ta
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Ilovada tasdiqlangan do'stlar
            </p>
          </div>

          {/* 4. Last AI Activity */}
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-dark-border/60 dark:bg-dark-cardSecondary">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              <span>Oxirgi AI Faollik</span>
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white truncate">
              {user.last_ai_activity_at ? formatDate(user.last_ai_activity_at) : "Hali yo'q"}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {user.last_ai_activity_at ? "So'nggi so'rov vaqti" : "AI ishlatilmagan"}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Financial Dynamics Chart */}
      {user.monthly_dynamics && user.monthly_dynamics.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-dark-border mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-finora-600 dark:text-finora-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Oylik Moliyaviy Dinamika (Grafik tahlil)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Oxirgi {user.monthly_dynamics.length} oy ko'rsatkichlari
            </span>
          </div>

          <MonthlyDynamicsChart
            data={user.monthly_dynamics.map((m: any) => ({
              label: m.month_name || `${m.month}-oy`,
              income: m.income || 0,
              expense: m.expense || 0,
              txCount: m.transaction_count,
            }))}
            height={220}
          />
        </div>
      )}

      {/* Connected Devices & Recent Transactions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Connected Devices */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-dark-border">
            <Smartphone className="h-4 w-4 text-slate-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Ulangan Qurilmalar ({user.devices?.length || 0})
            </h2>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-dark-border/60 max-h-[460px] overflow-y-auto pr-1">
            {(!user.devices || user.devices.length === 0) ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Qurilmalar ma'lumoti mavjud emas
              </p>
            ) : (
              user.devices.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      {d.device_name || d.device_type || 'Noma\'lum qurilma'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      OS: {d.os_version || '-'} &bull; Versiya: {d.app_version || '-'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">
                      Oxirgi faollik: {formatDate(d.last_seen)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions (Up to 30) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Oxirgi Tranzaksiyalar ({user.recent_transactions?.length || 0} ta)
              </h2>
            </div>
            <span className="rounded-md bg-slate-100 dark:bg-dark-cardSecondary px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Oxirgi 30 tagacha
            </span>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-dark-border/60 max-h-[460px] overflow-y-auto pr-1">
            {(!user.recent_transactions || user.recent_transactions.length === 0) ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Tranzaksiyalar mavjud emas
              </p>
            ) : (
              user.recent_transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      {t.description || t.category_name || 'Noma\'lum xarajat'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {t.category_name} &bull; {t.transaction_date}
                    </div>
                  </div>
                  <div
                    className={`font-bold text-xs ${
                      t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Block User Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Foydalanuvchini bloklash
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.full_name || user.email}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bloklash sababi (foydalanuvchiga ko'rinadi)
              </label>
              <textarea
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="Masalan: Tizim qoidalarini buzganlik sababli..."
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleBlockUser}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/30 hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Bloklanmoqda...' : 'Bloklash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
