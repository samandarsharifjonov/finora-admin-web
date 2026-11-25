import React, { useCallback, useEffect, useState } from 'react'
import {
  ScrollText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  X,
} from 'lucide-react'
import { fetchAuditLogs } from '../lib/auditLogApi'
import type { AdminAuditLog } from '../types/auditLog'
import { formatDate } from '../lib/utils'
import { DateRangePicker } from '../components/common/DateRangePicker'
import { TableRowsSkeleton } from '../components/common/Skeleton'

interface ActionMeta {
  label: string
  badgeClass: string
}

const ACTION_META: Record<string, ActionMeta> = {
  'user.block': {
    label: 'Bloklash',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
  },
  'user.unblock': {
    label: 'Blokdan chiqarish',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
  },
  'user.delete': {
    label: "Hisob o'chirish",
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
  },
  'support.block': {
    label: 'Support blok',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
  },
  'support.unblock': {
    label: 'Support aktiv',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
  },
  'protected_user.add': {
    label: 'Himoya +',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60',
  },
  'protected_user.remove': {
    label: 'Himoya -',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
  },
  'admin.permissions_update': {
    label: 'Ruxsatlar',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/60',
  },
  'admin.revoke': {
    label: 'Admin bekor',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
  },
  'broadcast.create': {
    label: 'Xabarnoma',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/60',
  },
  'broadcast.cancel': {
    label: 'Xabar bekor',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
  },
  'broadcast.delete': {
    label: "Xabar o'chirish",
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
  },
  'broadcast.clear': {
    label: 'Xabar tozalash',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
  },
  'app_update.save': {
    label: 'Ilova versiya',
    badgeClass: 'bg-finora-500/15 text-finora-800 border-finora-500/30 dark:text-finora-300',
  },
  'terms.upload': {
    label: 'Shartlar PDF',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/60',
  },
  'terms.delete': {
    label: "Shartlar o'chirish",
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
  },
  'deletions.delete': {
    label: "Log o'chirish",
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
  },
  'deletions.clear': {
    label: 'Log tozalash',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
  },
  'ownership.initiate': {
    label: 'Egalik OTP',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
  },
  'ownership.verify': {
    label: 'Egalik tasdiq',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/60',
  },
  'ownership.revoke': {
    label: 'Egalik bekor',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
  },
}

const ACTION_TABS = [
  { id: 'all', label: 'Barchasi' },
  { id: 'user', label: 'Foydalanuvchilar' },
  { id: 'admin', label: 'Adminlar' },
  { id: 'broadcast', label: 'Xabarnomalar' },
  { id: 'system', label: 'Tizim' },
]

function getActionMeta(action: string): ActionMeta {
  return (
    ACTION_META[action] || {
      label: action,
      badgeClass:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
    }
  )
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [limit] = useState(25)
  const [offset, setOffset] = useState(0)
  const [actionGroup, setActionGroup] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAuditLogs({
        limit,
        offset,
        action: actionGroup,
        search,
        start_date: startDate,
        end_date: endDate,
      })
      setLogs(res.logs || [])
      setTotal(res.total || 0)
    } catch (err: any) {
      setError(err?.message || 'Audit loglarni yuklashda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }, [limit, offset, actionGroup, search, startDate, endDate])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOffset(0)
    setSearch(searchInput.trim())
  }

  const handleDateChange = (start: string, end: string) => {
    setOffset(0)
    setStartDate(start)
    setEndDate(end)
  }

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-5">
      {/* Compact Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Audit Log
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              <ShieldCheck className="h-3 w-3" />
              Super Admin
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Adminlar tomonidan bajarilgan muhim o‘zgarishlar jurnali (Jami: {total.toLocaleString()} ta)
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-finora-600' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Minimal Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-dark-border dark:bg-dark-card">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Admin, tavsif yoki IP bo‘yicha qidirish..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-8 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSearch('')
                  setOffset(0)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              placeholder="Sana bo‘yicha..."
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 dark:border-dark-border/60">
          {ACTION_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActionGroup(tab.id)
                setOffset(0)
              }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                actionGroup === tab.id
                  ? 'bg-finora-500 text-slate-950 shadow-2xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-cardSecondary dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Compact Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Vaqt</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Amal</th>
                <th className="px-4 py-3">Tavsif</th>
                <th className="px-4 py-3 text-right">IP manzil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60">
              {loading ? (
                <TableRowsSkeleton rows={8} cols={5} />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-dark-cardSecondary">
                        <ScrollText className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                        Hozircha yozuvlar topilmadi
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Adminlar tomonidan bajarilgan amallar shu yerda avtomatik qayd etiladi.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(item => {
                  const meta = getActionMeta(item.action)
                  const hasDetails = Boolean(item.details && Object.keys(item.details).length > 0)
                  const isExpanded = expandedId === item.id

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="transition-colors hover:bg-slate-50/70 dark:hover:bg-dark-cardSecondary/50">
                        <td className="whitespace-nowrap px-4 py-3 text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900 dark:text-white max-w-[170px]">
                              {item.actor_name || 'Admin'}
                            </p>
                            <p className="truncate text-[11px] text-slate-400 max-w-[170px]">
                              {item.actor_email || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10.5px] font-bold ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 dark:text-slate-200 leading-snug">
                              {item.summary}
                            </span>
                            {hasDetails && (
                              <button
                                type="button"
                                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 dark:border-dark-border dark:text-slate-400 dark:hover:bg-dark-cardSecondary"
                                title="Tafsilotlar"
                              >
                                <span>Tafsilot</span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[11px] text-slate-400">
                          {item.ip_address || '—'}
                        </td>
                      </tr>
                      {hasDetails && isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-dark-cardSecondary/40">
                          <td colSpan={5} className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
                              {Object.entries(item.details || {}).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                                    {k}:
                                  </span>
                                  <span className="font-mono text-slate-800 dark:text-slate-200">
                                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-dark-border dark:text-slate-400">
            <div className="tabular-nums">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{offset + 1}</span>
              {' - '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {Math.min(offset + limit, total)}
              </span>
              {' / '}
              {total}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Oldingi
              </button>
              <span className="px-2 font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
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
    </div>
  )
}
