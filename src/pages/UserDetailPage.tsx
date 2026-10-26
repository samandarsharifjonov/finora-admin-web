import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Smartphone,
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
  TrendingUp,
  Calendar,
  Check,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { AdminUserDetail } from '../types'
import { formatCurrency, formatCompactCurrency, formatDate } from '../lib/utils'
import { UserAvatar } from '../components/common/UserAvatar'
import {
  SparklineChart,
  GroupedBarChart,
  EcosystemRadarChart,
  EngagementDonutChart,
  CustomerSatisfactionGauge,
  type MonthlyFlowItem,
  type RadarItem,
  type DonutSlice,
} from '../components/common/ModernCharts'

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canBlock = hasPermission('users.block')
  const canDelete = hasPermission('users.delete')

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Block modal
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUserDetail = async (isManualRefresh = false) => {
    if (!id) return
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<AdminUserDetail>(`/admin/users/${id}`)
      setUser(res)
    } catch (err: any) {
      setError(err?.message || "Foydalanuvchi ma'lumotlarini yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
      setRefreshing(false)
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
      fetchUserDetail(true)
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
      fetchUserDetail(true)
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
            Foydalanuvchi ma'lumotlari va grafiklar yuklanmoqda...
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

  // --- Derived Analytics and Chart Data ---

  // 1. Sort monthly dynamics chronologically (oldest to newest)
  const sortedDynamics = user.monthly_dynamics && user.monthly_dynamics.length > 0
    ? [...user.monthly_dynamics].sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
    : []

  // 2. Monthly flow data for GroupedBarChart
  const monthlyFlow: MonthlyFlowItem[] = sortedDynamics.length > 0
    ? sortedDynamics.map(m => ({
        label: m.month_name || `${m.month}-oy`,
        income: Number(m.income) || 0,
        expense: Number(m.expense) || 0,
        txCount: m.transaction_count,
      }))
    : [
        {
          label: 'Joriy',
          income: Number(user.total_income) || 0,
          expense: Number(user.total_expense) || 0,
          txCount: user.transaction_count || 0,
        },
      ]

  // 3. Sparklines for Top KPI Cards
  const incomeSparkline = sortedDynamics.length >= 2
    ? sortedDynamics.map(m => Number(m.income) || 0)
    : [0, (user.total_income || 0) * 0.35, (user.total_income || 0) * 0.7, user.total_income || 0]

  const expenseSparkline = sortedDynamics.length >= 2
    ? sortedDynamics.map(m => Number(m.expense) || 0)
    : [0, (user.total_expense || 0) * 0.4, (user.total_expense || 0) * 0.65, user.total_expense || 0]

  const balanceSparkline = sortedDynamics.length >= 2
    ? sortedDynamics.map(m => (Number(m.income) || 0) - (Number(m.expense) || 0))
    : [0, (user.balance || 0) * 0.45, user.balance || 0]

  const aiSparkline = sortedDynamics.length >= 2
    ? sortedDynamics.map(m => Math.max(1, Math.round((m.transaction_count || 0) * 0.6)))
    : [0, Math.round((user.ai_message_count || 0) * 0.5), user.ai_message_count || 0]

  // 4. Category Donut Slices
  const categoryColors = [
    '#10B981', // emerald
    '#6366F1', // indigo
    '#F59E0B', // amber
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#8B5CF6', // purple
  ]
  const topCats = user.top_categories || []
  const categorySlices: DonutSlice[] = topCats.length > 0
    ? topCats.map((c, i) => ({
        name: c.category_name || `Kategoriya #${c.category_id}`,
        value: Number(c.total_amount) || 0,
        color: c.category_color || c.color || categoryColors[i % categoryColors.length],
      }))
    : [
        { name: 'Xarajatlar', value: user.total_expense || 0, color: '#F59E0B' },
      ]

  // 5. Ecosystem Radar Data
  const txScore = Math.min(100, Math.max(25, (user.transaction_count || 0) * 3))
  const aiScore = Math.min(100, Math.max(20, ((user.ai_message_count || 0) * 4) + ((user.ai_transaction_count || 0) * 8)))
  const catScore = Math.min(100, Math.max(25, (topCats.length || 0) * 16))
  const netSavings = (user.total_income || 0) - (user.total_expense || 0)
  const savingsScore = (user.total_income || 0) > 0
    ? Math.min(100, Math.max(15, Math.round((netSavings / (user.total_income || 1)) * 100)))
    : 40
  const socialScore = Math.min(100, Math.max(15, (user.friend_count || 0) * 25))
  const deviceScore = Math.min(100, Math.max(30, (user.devices?.length || 1) * 40))

  const userRadarData: RadarItem[] = [
    { metric: 'Tranzaksiyalar', score: txScore, benchmark: 65 },
    { metric: 'Finora AI', score: aiScore, benchmark: 55 },
    { metric: 'Toifalar', score: catScore, benchmark: 70 },
    { metric: 'Tejamkorlik', score: Math.max(20, savingsScore), benchmark: 60 },
    { metric: "Do'stlar", score: socialScore, benchmark: 50 },
    { metric: 'Qurilmalar', score: deviceScore, benchmark: 70 },
  ]

  // 6. Financial Health & Discipline Gauge
  const savingsRatio = (user.total_income || 0) > 0 ? (netSavings / (user.total_income || 1)) * 100 : 0
  const healthScore = Math.min(
    100,
    Math.max(
      25,
      Math.round(
        50 +
        (savingsRatio > 0 ? savingsRatio * 0.3 : savingsRatio * 0.35) +
        Math.min(20, (user.transaction_count || 0) * 0.4) +
        Math.min(15, (user.ai_message_count || 0) * 1.5)
      )
    )
  )

  const gaugeBreakdown = [
    {
      category: 'Moliyaviy balans',
      range: netSavings >= 0 ? 'Ijobiy qoldiq' : 'Taqchillik',
      proportion: `${savingsRatio > 0 ? '+' : ''}${savingsRatio.toFixed(0)}%`,
      count: formatCompactCurrency(netSavings),
    },
    {
      category: 'Kiritilgan amallar',
      range: 'Jami tranzaksiyalar',
      proportion: `${user.transaction_count || 0} ta`,
      count: `${(user.recent_transactions || []).length} ta so'nggi`,
    },
    {
      category: 'Finora AI integratsiyasi',
      range: "Faollik ko'rsatkichi",
      proportion: `${user.ai_message_count || 0} xabar`,
      count: `${user.ai_transaction_count || 0} amal`,
    },
  ]

  // 7. Devices Breakdown
  const devicePlatformMap: Record<string, number> = {}
  ;(user.devices || []).forEach(d => {
    const raw = `${d.device_type || ''} ${d.device_name || ''} ${d.os_version || ''}`.toLowerCase()
    const plat = raw.includes('ios') || raw.includes('iphone') || raw.includes('ipad')
      ? 'iOS'
      : raw.includes('web') || raw.includes('browser')
      ? 'Web'
      : 'Android'
    devicePlatformMap[plat] = (devicePlatformMap[plat] || 0) + 1
  })
  const deviceSlices: DonutSlice[] = Object.keys(devicePlatformMap).length > 0
    ? Object.entries(devicePlatformMap).map(([plat, count]) => ({
        name: plat,
        value: count,
        color: plat === 'iOS' ? '#6366F1' : plat === 'Android' ? '#3B82F6' : '#F59E0B',
      }))
    : [
        { name: 'Mobil ilova', value: 1, color: '#3B82F6' },
      ]

  return (
    <div className="space-y-6">
      {/* Top bar with back button & refresh */}
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Foydalanuvchilar ro'yxatiga qaytish
        </Link>

        <button
          onClick={() => fetchUserDetail(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-finora-600' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* User Header Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-1 ring-2 ring-finora-500/30 ring-offset-2 ring-offset-white dark:ring-offset-dark-card shadow-sm">
              <UserAvatar
                src={user.avatar_url}
                name={user.full_name}
                email={user.email}
                size="xl"
                shape="circle"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                  {user.full_name || "Noma'lum"}
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
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {user.is_blocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                    <Ban className="h-3 w-3" /> Bloklangan: {user.blocked_reason || 'Sababsiz'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CheckCircle className="h-3 w-3" /> Faol
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-dark-cardSecondary dark:text-slate-300">
                  Kirish: {user.auth_provider || 'Email'}
                </span>
                {user.last_activity_at && (
                  <span className="text-[10px] text-slate-400">
                    Oxirgi tashrif: {formatDate(user.last_activity_at)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {!user.is_super_admin && (canBlock || canDelete) && (
            <div className="flex flex-wrap items-center gap-2">
              {canBlock &&
                (user.is_blocked ? (
                  <button
                    disabled={actionLoading}
                    onClick={handleUnblockUser}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors shadow-sm"
                  >
                    <Unlock className="h-3.5 w-3.5" /> Blokdan chiqarish
                  </button>
                ) : (
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowBlockModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors shadow-sm"
                  >
                    <Lock className="h-3.5 w-3.5" /> Bloklash
                  </button>
                ))}

              {canDelete && (
                <button
                  disabled={actionLoading}
                  onClick={handleDeleteUser}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors shadow-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" /> O'chirish
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top KPI Cards Row with Sparklines (4 Modern Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Joriy Balans */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Joriy balans
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-finora-50 text-finora-600 dark:bg-finora-950/60 dark:text-finora-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(user.balance ?? 0)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                {(user.balance ?? 0) >= 0 ? 'Ijobiy qoldiq' : 'Taqchillik'}
              </div>
            </div>
            <SparklineChart
              data={balanceSparkline}
              isPositive={(user.balance ?? 0) >= 0}
              color={(user.balance ?? 0) >= 0 ? '#10B981' : '#F43F5E'}
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10.5px] text-slate-500 dark:border-dark-border/60 dark:text-slate-400">
            <span>Hamyonlar & kartalar:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Faol hisoblar</span>
          </div>
        </div>

        {/* Card 2: Jami Kirim */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Jami kirim
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(user.total_income ?? 0)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Tushumlar oqimi
              </div>
            </div>
            <SparklineChart data={incomeSparkline} isPositive={true} color="#10B981" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10.5px] text-slate-500 dark:border-dark-border/60 dark:text-slate-400">
            <span>Oxirgi 12 oy:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatCompactCurrency(user.total_income ?? 0)}
            </span>
          </div>
        </div>

        {/* Card 3: Jami Chiqim */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Jami chiqim
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                {formatCurrency(user.total_expense ?? 0)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                {user.transaction_count ?? 0} ta tranzaksiya
              </div>
            </div>
            <SparklineChart data={expenseSparkline} isPositive={false} color="#F59E0B" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10.5px] text-slate-500 dark:border-dark-border/60 dark:text-slate-400">
            <span>Soliq cheklari:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{user.receipt_count ?? 0} ta skan</span>
          </div>
        </div>

        {/* Card 4: Finora AI & Ijtimoiy */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Finora AI & Ijtimoiy
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {user.ai_message_count ?? 0}
                <span className="text-xs text-slate-400 ml-1 font-normal">xabar</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                +{user.ai_transaction_count ?? 0} ta AI amal
              </div>
            </div>
            <SparklineChart data={aiSparkline} color="#8B5CF6" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10.5px] text-slate-500 dark:border-dark-border/60 dark:text-slate-400">
            <span>Do'stlar tarmog'i:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{user.friend_count ?? 0} ta do'st</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Charts Grid (Oylik Moliyaviy Oqim Bar + Xarajatlar Donut Charti) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Oylik Moliyaviy Oqim Dual Bar Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <GroupedBarChart
            data={monthlyFlow}
            title="Oylik moliyaviy oqim"
            subtitle={`Kirim va Chiqim balansi (${monthlyFlow.length} oylik dinamika)`}
            height={260}
          />
        </div>

        {/* Xarajatlar Strukturasi Donut Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <EngagementDonutChart
            data={categorySlices}
            title="Xarajatlar Kategoriyalari"
            subtitle="Asosiy yo'nalishlar taqsimoti"
            totalLabel="Jami Chiqim"
            totalCount={user.total_expense || undefined}
            showCurrency={true}
            height={200}
          />

          {/* Top categories breakdown mini list */}
          {topCats.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-dark-border/60 space-y-1.5">
              {topCats.slice(0, 3).map((cat, idx) => (
                <div key={cat.category_id || idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          cat.category_color || cat.color || categoryColors[idx % categoryColors.length],
                      }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 truncate font-medium">
                      {cat.category_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCompactCurrency(cat.total_amount)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({cat.percentage ? Math.round(cat.percentage) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Secondary Analytics Grid (Radar Chart + Health Gauge + Devices) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Foydalanuvchi Ekotizim Radari */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <EcosystemRadarChart
            data={userRadarData}
            title="Foydalanuvchi Ekotizim Tahlili"
            subtitle="Ilova imkoniyatlaridan foydalanish ko'rsatkichi"
            height={250}
          />
        </div>

        {/* Moliyaviy Intizom & Salomatlik Gauge */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <CustomerSatisfactionGauge
            score={healthScore}
            title="Moliyaviy Intizom Indeksi"
            subtitle="Faollik va tejash barqarorligi"
            badgeLabel={healthScore >= 75 ? "A'lo darajada" : healthScore >= 50 ? "O'rtacha" : "E'tibor talab"}
            breakdown={gaugeBreakdown}
          />
        </div>

        {/* Qurilmalar Platformalari Donut & Mini Info */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between">
          <EngagementDonutChart
            data={deviceSlices}
            title="Qurilma Platformalari"
            subtitle="Mobil & Web ulushlari"
            totalLabel="Qurilmalar"
            totalCount={user.devices?.length || 1}
            height={180}
          />

          <div className="mt-2 border-t border-slate-100 pt-3 dark:border-dark-border/60 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Ulangan sessiyalar:</span>
              <strong className="text-slate-900 dark:text-white font-bold">
                {user.devices?.length || 0} ta
              </strong>
            </div>
            <div className="mt-1 flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Oxirgi faollik:</span>
              <span className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-300">
                {user.last_activity_at ? formatDate(user.last_activity_at) : 'Yaqinda'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Connected Devices & Recent Transactions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Connected Devices Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-dark-border">
            <Smartphone className="h-4 w-4 text-slate-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Ulangan qurilmalar tafsiloti ({user.devices?.length || 0})
            </h2>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-dark-border/60 max-h-[440px] overflow-y-auto pr-1">
            {!user.devices || user.devices.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Qurilmalar ma'lumoti mavjud emas
              </p>
            ) : (
              user.devices.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 hover:bg-slate-50/50 dark:hover:bg-dark-cardSecondary/30 rounded-lg px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-dark-cardSecondary dark:text-slate-300 font-bold text-xs">
                      {d.device_type?.toLowerCase().includes('ios') ? 'iOS' : 'AND'}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {d.device_name || d.device_type || "Noma'lum qurilma"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        OS: {d.os_version || '-'} &bull; Versiya: {d.app_version || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold text-slate-600 dark:bg-dark-cardSecondary dark:text-slate-300">
                      {formatDate(d.last_seen)}
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
                Oxirgi tranzaksiyalar ({user.recent_transactions?.length || 0} ta)
              </h2>
            </div>
            <span className="rounded-md bg-slate-100 dark:bg-dark-cardSecondary px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Oxirgi 30 tagacha
            </span>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-dark-border/60 max-h-[440px] overflow-y-auto pr-1">
            {!user.recent_transactions || user.recent_transactions.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Tranzaksiyalar mavjud emas
              </p>
            ) : (
              user.recent_transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2.5 hover:bg-slate-50/50 dark:hover:bg-dark-cardSecondary/30 rounded-lg px-2 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${
                        t.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {t.type === 'income' ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {t.description || t.category_name || "Noma'lum xarajat"}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {t.category_name} &bull; {t.transaction_date}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-xs shrink-0 ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-dark-border dark:bg-dark-card">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Bloklash
                </h3>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.full_name || user.email}
                </p>
              </div>
            </div>

            <div className="mt-3.5">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Sabab:
              </label>
              <textarea
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="Bloklash sababi..."
                rows={2}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white resize-none"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleBlockUser}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Saqlanmoqda...' : 'Bloklash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

