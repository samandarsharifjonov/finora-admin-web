import React, { useEffect, useState } from 'react'
import {
  UserPlus,
  Trash2,
  Edit2,
  Search,
  RefreshCw,
  Crown,
  ShieldCheck,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type { AdminUserWithPerms, PermissionMeta } from '../types'
import { UserAvatar } from '../components/common/UserAvatar'
import { getPermissionInfo } from '../lib/permissions'

export const AdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUserWithPerms[]>([])
  const [permissionsMeta, setPermissionsMeta] = useState<PermissionMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit permissions modal
  const [editingAdmin, setEditingAdmin] = useState<AdminUserWithPerms | null>(null)
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  // Search new admin candidate
  const [searchQuery, setSearchQuery] = useState('')
  const [candidates, setCandidates] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchAdminsAndMeta = async () => {
    setLoading(true)
    setError(null)
    try {
      const [adminsRes, metaRes] = await Promise.all([
        apiRequest<AdminUserWithPerms[]>('/admin/admins'),
        apiRequest<PermissionMeta[]>('/admin/permissions'),
      ])
      setAdmins(adminsRes || [])
      setPermissionsMeta(metaRes || [])
    } catch (err: any) {
      setError(err?.message || "Adminlar ma'lumotlarini yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminsAndMeta()
  }, [])

  const handleOpenEdit = (admin: AdminUserWithPerms) => {
    setEditingAdmin(admin)
    setSelectedPerms([...admin.permissions])
  }

  const togglePermission = (code: string) => {
    if (selectedPerms.includes(code)) {
      setSelectedPerms(selectedPerms.filter(p => p !== code))
    } else {
      setSelectedPerms([...selectedPerms, code])
    }
  }

  const handleSavePermissions = async () => {
    if (!editingAdmin) return
    const adminId = editingAdmin.user_id ?? editingAdmin.id
    setActionLoading(true)
    try {
      await apiRequest(`/admin/admins/${adminId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: selectedPerms }),
      })
      setEditingAdmin(null)
      fetchAdminsAndMeta()
    } catch (err: any) {
      alert(err?.message || "Ruxsatlarni saqlashda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRevokeAdmin = async (admin: AdminUserWithPerms) => {
    if (!confirm(`${admin.full_name || admin.email} adminlik huquqini bekor qilmoqchimisiz?`)) return
    const adminId = admin.user_id ?? admin.id
    setActionLoading(true)
    try {
      await apiRequest(`/admin/admins/${adminId}/revoke`, { method: 'DELETE' })
      fetchAdminsAndMeta()
    } catch (err: any) {
      alert(err?.message || "Bekor qilishda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSearchCandidates = async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setCandidates([])
      return
    }
    setIsSearching(true)
    try {
      const res = await apiRequest<any[]>(`/admin/admins/search-users?q=${encodeURIComponent(q.trim())}`)
      setCandidates(res || [])
    } catch {
      setCandidates([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAssignAdmin = async (candidate: any) => {
    const candidateId = candidate.user_id ?? candidate.id
    setActionLoading(true)
    try {
      // Default view permissions
      await apiRequest(`/admin/admins/${candidateId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: ['overview.view', 'users.view'] }),
      })
      setShowAddModal(false)
      setCandidates([])
      setSearchQuery('')
      fetchAdminsAndMeta()
    } catch (err: any) {
      alert(err?.message || "Admin tayinlashda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Adminlar va Rollar Boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Tizim adminlari ro'yxati va ularning granular huquqlarini (RBAC) boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminsAndMeta}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Yangilash
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-finora-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-finora-500/25 transition-colors hover:bg-finora-600"
          >
            <UserPlus className="h-3.5 w-3.5" /> Yangi Admin Tayinlash
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20">
          {error}
        </div>
      )}

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-finora-500 border-t-transparent" />
          </div>
        ) : admins.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Adminlar topilmadi
          </div>
        ) : (
          admins.map(admin => (
            <div
              key={admin.user_id ?? admin.id ?? admin.email}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={admin.avatar_url}
                      name={admin.full_name}
                      email={admin.email}
                      size="md"
                    />
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                        {admin.full_name || 'Noma\'lum'}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                  {admin.is_super_admin && (
                    <span className="flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      <Crown className="h-3 w-3" /> OWNER
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Biriktirilgan Huquqlar:</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {admin.is_super_admin ? 'Cheksiz' : `${admin.permissions?.length || 0} ta`}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    {admin.is_super_admin ? (
                      <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>Barcha tizim ruxsatlari (To'liq huquq)</span>
                      </div>
                    ) : admin.permissions && admin.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {admin.permissions.map(code => {
                          const info = getPermissionInfo(code)
                          return (
                            <span
                              key={code}
                              title={`${info.label} (${code})`}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-medium ${info.color}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                              <span>{info.shortLabel}</span>
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 dark:border-dark-border p-2 text-center text-[11px] text-slate-400">
                        Hech qanday ruxsat berilmagan
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!admin.is_super_admin && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(admin)}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="h-3 w-3" /> Ruxsatlar
                  </button>
                  <button
                    onClick={() => handleRevokeAdmin(admin)}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" /> Bekor qilish
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Permissions Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Admin Ruxsatlarini Sozlash
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {editingAdmin.full_name || editingAdmin.email}
            </p>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2 pr-1">
              {permissionsMeta.map(meta => {
                const checked = selectedPerms.includes(meta.code)
                const info = getPermissionInfo(meta.code)
                return (
                  <label
                    key={meta.code}
                    onClick={() => togglePermission(meta.code)}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      checked
                        ? 'border-finora-500/50 bg-finora-500/10 dark:border-finora-500/40 dark:bg-finora-950/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-finora-600 focus:ring-finora-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {meta.name || info.label}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${info.color}`}>
                          {info.shortLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {meta.description}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSavePermissions}
                className="rounded-xl bg-finora-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-finora-600/30 hover:bg-finora-700 disabled:opacity-50"
              >
                {actionLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Yangi Admin Tayinlash
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mavjud foydalanuvchilar orasidan qidiring
            </p>

            <div className="mt-4 relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchCandidates(e.target.value)}
                placeholder="Foydalanuvchi ismi yoki emaili..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none focus:border-finora-500 focus:bg-white dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
              />
            </div>

            <div className="mt-3 max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border/60">
              {isSearching ? (
                <div className="py-6 text-center text-xs text-slate-400">Qidirilmoqda...</div>
              ) : candidates.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  {searchQuery ? "Mos foydalanuvchi topilmadi" : "Qidiruv uchun matn kiriting"}
                </div>
              ) : (
                candidates.map(c => (
                  <div key={c.id || c.user_id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={c.avatar_url}
                        name={c.full_name}
                        email={c.email}
                        size="sm"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {c.full_name || 'Noma\'lum'}
                        </div>
                        <div className="text-[11px] text-slate-400">{c.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignAdmin(c)}
                      className="rounded-lg bg-finora-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-finora-700"
                    >
                      Tayinlash
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
