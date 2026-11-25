import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ScrollText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Activity,
  X,
} from 'lucide-react'
import { fetchAuditAdmins, fetchAuditLogs } from '../lib/auditLogApi'
import type { AdminAuditLog, AuditAdminSummary } from '../types/auditLog'
import { formatDate } from '../lib/utils'
import { DateRangePicker } from '../components/common/DateRangePicker'
import { UserAvatar } from '../components/common/UserAvatar'
import { Skeleton } from '../components/common/Skeleton'

interface ActionMeta {
  label: string
  badgeClass: string
  dotClass: string
}

const ACTION_META: Record<string, ActionMeta> = {
  'user.block': {
    label: 'Bloklash',
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
    dotClass: 'bg-rose-500',
  },
  'user.unblock': {
    label: 'Blokdan chiqarish',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
    dotClass: 'bg-emerald-500',
  },
  'user.delete': {
    label: "Hisob o'chirish",
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
    dotClass: 'bg-rose-600',
  },
  'support.block': {
    label: 'Support blok',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
    dotClass: 'bg-amber-500',
  },
  'support.unblock': {
    label: 'Support aktiv',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
    dotClass: 'bg-emerald-500',
  },
  'protected_user.add': {
    label: 'Himoya +',
    badgeClass:
      'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60',
    dotClass: 'bg-sky-500',
  },
  'protected_user.remove': {
    label: 'Himoya -',
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
    dotClass: 'bg-slate-400',
  },
  'admin.permissions_update': {
    label: 'Ruxsatlar',
    badgeClass:
      'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/60',
    dotClass: 'bg-indigo-500',
  },
  'admin.revoke': {
    label: 'Admin bekor',
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
    dotClass: 'bg-rose-500',
  },
  'broadcast.create': {
    label: 'Xabarnoma',
    badgeClass:
      'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/60',
    dotClass: 'bg-purple-500',
  },
  'broadcast.cancel': {
    label: 'Xabar bekor',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
    dotClass: 'bg-amber-500',
  },
  'broadcast.delete': {
    label: "Xabar o'chirish",
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
    dotClass: 'bg-slate-400',
  },
  'broadcast.clear': {
    label: 'Xabar tozalash',
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
    dotClass: 'bg-slate-400',
  },
  'app_update.save': {
    label: 'Ilova versiya',
    badgeClass:
      'bg-finora-500/15 text-finora-800 border-finora-500/30 dark:text-finora-300',
    dotClass: 'bg-finora-500',
  },
  'terms.upload': {
    label: 'Shartlar PDF',
    badgeClass:
      'bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/60',
    dotClass: 'bg-teal-500',
  },
  'terms.delete': {
    label: "Shartlar o'chirish",
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
    dotClass: 'bg-rose-500',
  },
  'deletions.delete': {
    label: "Log o'chirish",
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
    dotClass: 'bg-slate-400',
  },
  'deletions.clear': {
    label: 'Log tozalash',
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
    dotClass: 'bg-slate-400',
  },
}

const TARGET_LABELS: Record<string, string> = {
  user: 'Foydalanuvchi',
  admin: 'Admin',
  broadcast: 'Xabarnoma',
  terms: 'Shartlar PDF',
  app_update: 'Ilova versiyasi',
  system: 'Tizim',
  ownership: 'Egalik',
}

const ACTION_TABS = [
  { id: 'all', label: 'Barchasi' },
  { id: 'user', label: 'Foydalanuvchilar' },
  { id: 'broadcast', label: 'Xabarnomalar' },
  { id: 'system', label: 'Tizim' },
]

function getActionMeta(action: string): ActionMeta {
  return (
    ACTION_META[action] || {
      label: action,
      badgeClass:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:border-dark-border',
      dotClass: 'bg-slate-400',
    }
  )
}

function formatTargetNode(targetType: string, targetId?: number | null): string {
  const base = TARGET_LABELS[targetType] || targetType || 'Tizim'
  return targetId ? `${base} #${targetId}` : base
}

export const AuditLogsPage: React.FC = () => {
  // Stage 1: Regular admins list
  const [admins, setAdmins] = useState<AuditAdminSummary[]>([])
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [adminsError, setAdminsError] = useState<string | null>(null)
  const [adminSearch, setAdminSearch] = useState('')

  // Stage 2: Selected admin's action flow
  const [selectedAdmin, setSelectedAdmin] = useState<AuditAdminSummary | null>(null)
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [actionGroup, setActionGroup] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsError, setLogsError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const loadAdmins = useCallback(async () => {
    setAdminsLoading(true)
    setAdminsError(null)
    try {
      const res = await fetchAuditAdmins()
      setAdmins(Array.isArray(res) ? res : [])
    } catch (err: any) {
      setAdminsError(err?.message || "Adminlar ro'yxatini yuklashda xatolik yuz berdi")
    } finally {
      setAdminsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  const loadAdminLogs = useCallback(async () => {
    if (!selectedAdmin) return
    setLogsLoading(true)
    setLogsError(null)
    try {
      const res = await fetchAuditLogs({
        limit,
        offset,
        actor_id: selectedAdmin.user_id,
        action: actionGroup,
        start_date: startDate,
        end_date: endDate,
      })
      setLogs(res.logs || [])
      setTotal(res.total || 0)
    } catch (err: any) {
      setLogsError(err?.message || 'Harakatlar tarixini yuklashda xatolik yuz berdi')
    } finally {
      setLogsLoading(false)
    }
  }, [selectedAdmin, limit, offset, actionGroup, startDate, endDate])

  useEffect(() => {
    if (selectedAdmin) {
      loadAdminLogs()
    }
  }, [selectedAdmin, loadAdminLogs])

  const filteredAdmins = useMemo(() => {
    const q = adminSearch.trim().toLowerCase()
    if (!q) return admins
    return admins.filter(
      a =>
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.last_summary || '').toLowerCase().includes(q)
    )
  }, [admins, adminSearch])

  const handleSelectAdmin = (admin: AuditAdminSummary) => {
    setSelectedAdmin(admin)
    setOffset(0)
    setActionGroup('all')
    setStartDate('')
    setEndDate('')
    setExpandedId(null)
  }

  const handleBackToList = () => {
    setSelectedAdmin(null)
    setLogs([])
    setTotal(0)
  }

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  // ==========================================================
  // VIEW 2: SELECTED ADMIN ACTION FLOW (ARROW TIMELINE)
  // ==========================================================
  if (selectedAdmin) {
    const adminDisplayName = selectedAdmin.full_name || selectedAdmin.email

    return (
      <div className="space-y-5">
        {/* Top Navigation + Admin Summary */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Adminlar</span>
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar
                src={selectedAdmin.avatar_url}
                name={selectedAdmin.full_name}
                email={selectedAdmin.email}
                size="md"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {adminDisplayName}
                  </h1>
                  <span className="shrink-0 rounded-full border border-finora-500/30 bg-finora-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-finora-800 dark:text-finora-300">
                    {total} ta amal
                  </span>
                </div>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedAdmin.email}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAdminLogs}
            disabled={logsLoading}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${logsLoading ? 'animate-spin text-finora-600' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>

        {/* Compact Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-dark-border dark:bg-dark-card sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto">
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

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => {
              setStartDate(s)
              setEndDate(e)
              setOffset(0)
            }}
            placeholder="Sana..."
          />
        </div>

        {logsError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            {logsError}
          </div>
        )}

        {/* Arrow Flow Timeline */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-6">
          {logsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Skeleton className="mt-1 h-3 w-3 rounded-full shrink-0" />
                  <Skeleton className="h-20 flex-1 rounded-xl" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-dark-cardSecondary">
                <Activity className="h-5 w-5" />
              </div>
              <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                Ushbu admin bo‘yicha harakatlar topilmadi
              </p>
              <p className="mt-1 max-w-xs text-[11px] text-slate-400">
                Tanlangan davr yoki filtr bo‘yicha hech qanday amal qayd etilmagan.
              </p>
            </div>
          ) : (
            <div className="relative pl-6">
              {/* Vertical timeline spine */}
              <div className="absolute bottom-3 left-[7px] top-3 w-px bg-slate-200 dark:bg-dark-border" />

              <div className="space-y-3.5">
                {logs.map(item => {
                  const meta = getActionMeta(item.action)
                  const targetNode = formatTargetNode(item.target_type, item.target_id)
                  const hasDetails = Boolean(item.details && Object.keys(item.details).length > 0)
                  const isExpanded = expandedId === item.id

                  return (
                    <div key={item.id} className="relative">
                      {/* Timeline node dot */}
                      <span
                        className={`absolute -left-6 top-4 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white dark:ring-dark-card ${meta.dotClass}`}
                      />

                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition-colors hover:border-slate-300/90 hover:bg-slate-50 dark:border-dark-border/80 dark:bg-dark-cardSecondary/35 dark:hover:bg-dark-cardSecondary/60">
                        {/* Arrow Flow Diagram: [Admin] ──▶ [Amal] ──▶ [Nishon] */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:border-dark-border dark:bg-dark-card dark:text-slate-200">
                            {selectedAdmin.full_name || selectedAdmin.email.split('@')[0]}
                          </span>

                          <span className="inline-flex items-center text-slate-400" aria-hidden="true">
                            <span className="h-px w-2.5 bg-slate-300 dark:bg-slate-600" />
                            <ArrowRight className="h-3.5 w-3.5 -ml-0.5" />
                          </span>

                          <span
                            className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>

                          <span className="inline-flex items-center text-slate-400" aria-hidden="true">
                            <span className="h-px w-2.5 bg-slate-300 dark:bg-slate-600" />
                            <ArrowRight className="h-3.5 w-3.5 -ml-0.5" />
                          </span>

                          <span className="inline-flex items-center rounded-lg border border-slate-200/80 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-dark-border dark:bg-dark-card/80 dark:text-slate-300">
                            {targetNode}
                          </span>
                        </div>

                        {/* Summary */}
                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                          {item.summary}
                        </p>

                        {/* Meta Footer */}
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Clock className="h-3 w-3" />
                              {formatDate(item.created_at)}
                            </span>
                            {item.ip_address && (
                              <span className="font-mono">{item.ip_address}</span>
                            )}
                          </div>

                          {hasDetails && (
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-dark-border dark:bg-dark-card dark:text-slate-300 dark:hover:bg-dark-cardSecondary"
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

                        {/* Expandable Details */}
                        {hasDetails && isExpanded && (
                          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-200/70 pt-2.5 text-[11px] dark:border-dark-border/60">
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
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-dark-border dark:text-slate-400">
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

  // ==========================================================
  // VIEW 1: REGULAR ADMINS LIST (SUPER ADMIN EXCLUDED)
  // ==========================================================
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
            Oddiy adminlar ro‘yxati — harakatlar oqimini ko‘rish uchun admin ustiga bosing
          </p>
        </div>

        <button
          type="button"
          onClick={loadAdmins}
          disabled={adminsLoading}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${adminsLoading ? 'animate-spin text-finora-600' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-dark-border dark:bg-dark-card">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={adminSearch}
            onChange={e => setAdminSearch(e.target.value)}
            placeholder="Admin ismi yoki email bo‘yicha qidirish..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-8 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
          />
          {adminSearch && (
            <button
              type="button"
              onClick={() => setAdminSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {adminsError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {adminsError}
        </div>
      )}

      {/* Admins List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
        {adminsLoading ? (
          <div className="divide-y divide-slate-100 dark:divide-dark-border/60">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-dark-cardSecondary">
              <ScrollText className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              Oddiy adminlar topilmadi
            </p>
            <p className="mt-1 max-w-xs text-[11px] text-slate-400">
              Hozircha tayinlangan oddiy adminlar mavjud emas yoki qidiruvga mos kelmadi.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-dark-border/60">
            {filteredAdmins.map(admin => {
              const lastMeta = admin.last_action ? getActionMeta(admin.last_action) : null
              return (
                <button
                  key={admin.user_id}
                  type="button"
                  onClick={() => handleSelectAdmin(admin)}
                  className="group flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-dark-cardSecondary/60 sm:px-5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <UserAvatar
                      src={admin.avatar_url}
                      name={admin.full_name}
                      email={admin.email}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                          {admin.full_name || 'Admin'}
                        </span>
                        <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-600 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300">
                          ADMIN
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-slate-400">{admin.email}</p>
                      {admin.last_summary && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {lastMeta && (
                            <span
                              className={`inline-flex shrink-0 rounded border px-1.5 py-0.2 text-[9.5px] font-bold ${lastMeta.badgeClass}`}
                            >
                              {lastMeta.label}
                            </span>
                          )}
                          <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{admin.last_summary}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-lg border border-finora-500/25 bg-finora-500/10 px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-finora-800 dark:text-finora-300">
                        {admin.total_actions} ta amal
                      </span>
                      <p className="mt-1 text-[10.5px] tabular-nums text-slate-400">
                        {admin.last_action_at ? formatDate(admin.last_action_at) : "Hali amal yo'q"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-finora-600 dark:group-hover:text-finora-400" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
