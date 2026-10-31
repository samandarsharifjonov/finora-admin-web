import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Shield,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  X,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type { AdminUserListItem, AdminUserListResponse } from '../types'
import { formatCurrency, formatDate } from '../lib/utils'
import { UserAvatar } from '../components/common/UserAvatar'
import { DateRangePicker } from '../components/common/DateRangePicker'

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState('active')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Block modal state
  const [blockingUser, setBlockingUser] = useState<AdminUserListItem | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<AdminUserListResponse>('/admin/users', {
        params: {
          limit,
          offset,
          search,
          sort_by: sortBy,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      })
      setUsers(res.users || [])
      setTotal(res.total || 0)
    } catch (err: any) {
      setError(err?.message || "Foydalanuvchilarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [offset, search, sortBy, startDate, endDate])

  const handleDateChange = (start: string, end: string) => {
    setOffset(0)
    setStartDate(start)
    setEndDate(end)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOffset(0)
    setSearch(searchInput.trim())
  }

  const handleBlockUser = async () => {
    if (!blockingUser) return
    setActionLoading(true)
    try {
      await apiRequest(`/admin/users/${blockingUser.id}/block`, {
        method: 'POST',
        body: JSON.stringify({ reason: blockReason.trim() || 'Qoidabuzarlik sababli' }),
      })
      setBlockingUser(null)
      setBlockReason('')
      fetchUsers()
    } catch (err: any) {
      alert(err?.message || "Foydalanuvchini bloklashda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblockUser = async (user: AdminUserListItem) => {
    if (!confirm(`Haqiqatan ham ${user.full_name || user.email} akkauntini blokdan chiqarmoqchimisiz?`)) {
      return
    }
    setActionLoading(true)
    try {
      await apiRequest(`/admin/users/${user.id}/unblock`, {
        method: 'POST',
      })
      fetchUsers()
    } catch (err: any) {
      alert(err?.message || "Blokdan chiqarishda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Foydalanuvchilar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Ilovadagi barcha ro'yxatdan o'tgan foydalanuvchilar (Jami: {total.toLocaleString()} ta)
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Yangilash
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Ism, email yoki telefon bo'yicha qidirish..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              placeholder="Faollik sanasi..."
            />

            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value)
                setOffset(0)
              }}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300"
            >
              <option value="active">Oxirgi faollar</option>
              <option value="newest">Yangi qo'shilganlar</option>
              <option value="balance">Balansi bo'yicha</option>
              <option value="transactions">Tranzaksiyalar soni</option>
            </select>
          </div>
        </div>

        {/* Active Date Filter Chip */}
        {Boolean(startDate || endDate) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Faol filtr:</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-finora-200 bg-finora-50/80 px-2.5 py-1 text-xs font-bold text-finora-700 dark:border-finora-800 dark:bg-finora-950/40 dark:text-finora-300">
              <span>
                {startDate === endDate
                  ? `${startDate} kuni tizimga kirganlar`
                  : `${startDate || '...'} dan ${endDate || '...'} gacha tizimga kirganlar`}
              </span>
              <button
                type="button"
                onClick={() => handleDateChange('', '')}
                className="rounded-full p-0.5 hover:bg-finora-200/70 dark:hover:bg-finora-900"
                title="Sana filtrini olib tashlash"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Table container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Foydalanuvchi</th>
                <th className="px-5 py-3.5">Balans</th>
                <th className="px-5 py-3.5 text-center">Tranzaksiyalar</th>
                <th className="px-5 py-3.5 text-center">Cheklar</th>
                <th className="px-5 py-3.5">Oxirgi faollik</th>
                <th className="px-5 py-3.5">Ro'yxatdan o'tgan</th>
                <th className="px-5 py-3.5">Holati</th>
                <th className="px-5 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-finora-500 border-t-transparent" />
                      <span>Yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    Hech qanday foydalanuvchi topilmadi
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const uid = u.user_id ?? u.id ?? 0
                  const bal = u.balance ?? ((u.total_income || 0) - (u.total_expense || 0))
                  const regDate = u.joined_at ?? u.created_at

                  return (
                    <tr
                      key={uid}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-dark-cardSecondary/50"
                    >
                      {/* User info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={u.avatar_url}
                            name={u.full_name}
                            email={u.email}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/users/${uid}`}
                                className="font-bold text-slate-900 hover:text-finora-600 dark:text-white dark:hover:text-finora-400"
                              >
                                {u.full_name || 'Noma\'lum'}
                              </Link>
                              {u.is_super_admin && (
                                <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                                  OWNER
                                </span>
                              )}
                              {u.is_admin && !u.is_super_admin && (
                                <span className="rounded bg-finora-100 px-1 py-0.2 text-[9px] font-bold text-finora-700 dark:bg-finora-950 dark:text-finora-300">
                                  ADMIN
                                </span>
                              )}
                              {u.is_protected && (
                                <span title="Himoyalangan hisob">
                                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                                </span>
                              )}
                            </div>
                            <div className="truncate text-[11px] text-slate-400">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(bal)}
                      </td>

                      {/* Transaction count */}
                      <td className="px-5 py-3.5 text-center font-medium text-slate-600 dark:text-slate-400">
                        {u.transaction_count} ta
                      </td>

                      {/* Receipt count */}
                      <td className="px-5 py-3.5 text-center font-medium text-slate-600 dark:text-slate-400">
                        {u.receipt_count || 0} ta
                      </td>

                      {/* Last Active */}
                      <td className="px-5 py-3.5 text-[11px]">
                        {u.last_activity_at ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {formatDate(u.last_activity_at)}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              tizimga kirgan
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Kirilmagan</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {formatDate(regDate)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {u.is_blocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <Ban className="h-3 w-3" /> Bloklangan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> Faol
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/users/${uid}`}
                            title="Ko'rish"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1 text-slate-500 transition-colors hover:text-slate-900 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-400 dark:hover:text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          {!u.is_super_admin && (
                            u.is_blocked ? (
                              <button
                                onClick={() => handleUnblockUser(u)}
                                title="Blokdan chiqarish"
                                className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/80 p-1 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                              >
                                <Unlock className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setBlockingUser(u)}
                                title="Bloklash"
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                              >
                                <Lock className="h-3.5 w-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {total > limit && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3.5 dark:border-dark-border text-xs text-slate-500 dark:text-slate-400">
            <div>
              Ko'rsatilmoqda: <span className="font-semibold text-slate-700 dark:text-slate-200">{offset + 1}</span> -{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {Math.min(offset + limit, total)}
              </span>{' '}
              / {total}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Oldingi
              </button>
              <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={offset + limit >= total}
                onClick={() => setOffset(offset + limit)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300"
              >
                Keyingi <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Block User Modal */}
      {blockingUser && (
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
                  {blockingUser.full_name || blockingUser.email}
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
                onClick={() => setBlockingUser(null)}
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
