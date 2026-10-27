import React, { useEffect, useState, useTransition } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  UserPlus,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  X,
} from 'lucide-react'
import type { ProtectedUser, ProtectedCandidateUser } from '../types'
import {
  fetchProtectedUsers,
  addProtectedUsers,
  removeProtectedUser,
  fetchProtectedCandidates,
} from '../lib/protectedUsersApi'
import { UserAvatar } from '../components/common/UserAvatar'
import { formatCurrency, formatDate } from '../lib/utils'

export const ProtectedUsersPage: React.FC = () => {
  const [users, setUsers] = useState<ProtectedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  // Candidate Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [candidates, setCandidates] = useState<ProtectedCandidateUser[]>([])
  const [candidatesLoading, setCandidatesLoading] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [submittingAdd, setSubmittingAdd] = useState(false)
  const [, startTransition] = useTransition()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProtectedUsers()
      setUsers(data || [])
    } catch (err: any) {
      setError(err?.message || "Himoyalangan akkauntlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRemove = async (user: ProtectedUser) => {
    if (!window.confirm(`Haqiqatan ham "${user.full_name || user.email}" hisobidan himoyani olib tashlamoqchimisiz?`)) {
      return
    }

    setActionLoadingId(user.user_id)
    setError(null)
    setSuccessMsg(null)
    try {
      await removeProtectedUser(user.user_id)
      setSuccessMsg(`"${user.full_name || user.email}" himoyalanganlar ro'yxatidan muvaffaqiyatli chiqarildi`)
      setUsers(prev => prev.filter(u => u.user_id !== user.user_id))
    } catch (err: any) {
      setError(err?.message || "Himoyani bekor qilishda xatolik yuz berdi")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOpenAddModal = async () => {
    setShowAddModal(true)
    setSelectedUserIds([])
    setSearchQuery('')
    loadCandidates('')
  }

  const loadCandidates = async (query: string) => {
    setCandidatesLoading(true)
    try {
      const res = await fetchProtectedCandidates({ search: query, limit: 30 })
      setCandidates(res.users || [])
    } catch (err: any) {
      console.error(err)
      setCandidates([])
    } finally {
      setCandidatesLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    startTransition(() => {
      loadCandidates(val)
    })
  }

  const toggleSelectUser = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleSelectAllCandidates = () => {
    if (selectedUserIds.length === candidates.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(candidates.map(c => c.user_id))
    }
  }

  const handleAddSubmit = async () => {
    if (selectedUserIds.length === 0) return
    setSubmittingAdd(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await addProtectedUsers(selectedUserIds)
      setShowAddModal(false)
      setSelectedUserIds([])
      setSuccessMsg(`${selectedUserIds.length} ta foydalanuvchi himoyalangan hisoblar ro'yxatiga qo'shildi`)
      loadData()
    } catch (err: any) {
      setError(err?.message || "Foydalanuvchilarni himoyalashda xatolik yuz berdi")
    } finally {
      setSubmittingAdd(false)
    }
  }

  // Summary stats
  const totalProtected = users.length
  const totalIncomeAll = users.reduce((acc, u) => acc + (u.total_income || 0), 0)
  const totalExpenseAll = users.reduce((acc, u) => acc + (u.total_expense || 0), 0)
  const totalTransactions = users.reduce((acc, u) => acc + (u.transaction_count || 0), 0)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Himoyalangan Akkauntlar
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
              <Lock className="h-3 w-3" />
              Faqat Super Admin
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Tizim asoschilari va VIP foydalanuvchilar. Ushbu hisoblar oddiy adminlar tomonidan bloklanishi yoki o'chirilishidan himoyalangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yangilash
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <UserPlus className="h-4 w-4" />
            Yangi hisob qo'shish
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami himoyalangan</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {totalProtected}
          </div>
          <span className="text-[11px] text-slate-400">VIP & Asoschilar ro'yxati</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami kirim</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncomeAll)}
          </div>
          <span className="text-[11px] text-slate-400">Barcha davr uchun</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami xarajat</span>
            <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpenseAll)}
          </div>
          <span className="text-[11px] text-slate-400">Barcha davr uchun</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tranzaksiyalar</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {totalTransactions.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Bajarilgan operatsiyalar</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Himoyalangan Hisoblar Ro'yxati
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {users.length} ta hisob
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="mt-3 text-xs text-slate-400">Himoyalangan akkauntlar yuklanmoqda...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-2xl bg-indigo-50/50 p-4 dark:bg-indigo-950/30">
              <ShieldCheck className="h-10 w-10 text-indigo-400" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">
              Hozircha himoyalangan hisoblar mavjud emas
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Asoschilar yoki VIP foydalanuvchilarni ro'yxatga qo'shish uchun yuqoridagi "Yangi hisob qo'shish" tugmasini bosing.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              <UserPlus className="h-4 w-4" />
              Hisob qo'shish
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Foydalanuvchi</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5">Himoyalangan sana</th>
                  <th scope="col" className="px-6 py-3.5">Kirim / Chiqim</th>
                  <th scope="col" className="px-6 py-3.5">Tranzaksiyalar</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {users.map((user) => (
                  <tr
                    key={user.user_id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.avatar_url}
                          name={user.full_name || user.email}
                          className="h-10 w-10 text-xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span>{user.full_name || 'Nomaʼlum foydalanuvchi'}</span>
                            <span title="Himoyalangan hisob" className="inline-flex">
                              <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                          <div className="mt-0.5 text-[10px] text-slate-400">
                            Auth: <span className="font-medium text-slate-500 uppercase">{user.auth_provider}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Himoyalangan
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {formatDate(user.protected_at)}
                      </div>
                      {user.protected_by_email && (
                        <div className="text-[10px] text-slate-400">
                          Kim tomondan: <span className="font-semibold text-slate-500">{user.protected_by_email}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(user.total_income || 0)}
                        </div>
                        <div className="font-bold text-rose-600 dark:text-rose-400">
                          -{formatCurrency(user.total_expense || 0)}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {user.transaction_count} ta
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemove(user)}
                        disabled={actionLoadingId === user.user_id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60"
                        title="Himoyani bekor qilish"
                      >
                        {actionLoadingId === user.user_id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldOff className="h-3.5 w-3.5" />
                        )}
                        Himoyadan chiqarish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Candidates Modal (Multiselect) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Himoyalash uchun foydalanuvchilarni tanlash
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ro'yxatdan bir yoki bir nechta foydalanuvchini belgilang (Multiselect)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ism yoki email bo'yicha qidirish..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            {/* Candidates Selection Header */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Mavjud nomzodlar: {candidates.length} ta</span>
              <button
                onClick={handleSelectAllCandidates}
                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {selectedUserIds.length === candidates.length && candidates.length > 0
                  ? "Barchasini bekor qilish"
                  : "Barchasini tanlash"}
              </button>
            </div>

            {/* Candidates List */}
            <div className="mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 dark:border-slate-800 dark:divide-slate-800">
              {candidatesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  Foydalanuvchi topilmadi
                </div>
              ) : (
                candidates.map((cand) => {
                  const isSelected = selectedUserIds.includes(cand.user_id)
                  return (
                    <div
                      key={cand.user_id}
                      onClick={() => toggleSelectUser(cand.user_id)}
                      className={`flex cursor-pointer items-center justify-between p-3 transition ${
                        isSelected
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <UserAvatar
                          src={cand.avatar_url}
                          name={cand.full_name || cand.email}
                          className="h-9 w-9 text-xs"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {cand.full_name || 'Nomaʼlum'}
                          </div>
                          <div className="text-[11px] text-slate-400">{cand.email}</div>
                        </div>
                      </div>

                      <div className="text-right text-[11px]">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {cand.transaction_count} ta tranzaksiya
                        </div>
                        <div className="text-slate-400">
                          +{formatCurrency(cand.total_income)} / -{formatCurrency(cand.total_expense)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {selectedUserIds.length} ta foydalanuvchi tanlandi
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={submittingAdd || selectedUserIds.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingAdd ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Tanlanganlarni himoyalash ({selectedUserIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default ProtectedUsersPage
