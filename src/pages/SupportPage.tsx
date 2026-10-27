import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  RefreshCw,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  ArrowRight,
  Ban,
  Unlock,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { useSupportChats, type FilterTab } from '../hooks/useSupportChats'
import { SupportStats } from '../components/support/SupportStats'
import { BlockUserModal } from '../components/support/BlockUserModal'
import { UserAvatar } from '../components/common/UserAvatar'
import { formatDate } from '../lib/utils'
import type { SupportChat } from '../types/support'

export const SupportPage: React.FC = () => {
  const {
    chats,
    rawChatsCount,
    total,
    stats,
    loading,
    refreshing,
    error,
    search,
    setSearch,
    tab,
    setTab,
    socketStatus,
    refresh,
    handleBlock,
    handleUnblock,
    handleHide,
  } = useSupportChats()

  const [searchInput, setSearchInput] = useState(search)
  const [blockingChat, setBlockingChat] = useState<SupportChat | null>(null)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const renderMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-3 w-3 text-indigo-500 shrink-0" />
      case 'voice':
        return <Mic className="h-3 w-3 text-purple-500 shrink-0" />
      default:
        return <MessageSquare className="h-3 w-3 text-slate-400 shrink-0" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Murojaatlar
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                socketStatus === 'connected'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  socketStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {socketStatus === 'connected' ? 'Real-time onlayn' : 'Sinxron'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Foydalanuvchilar bilan jonli chat va qo‘llab-quvvatlash markazi (Jami: {total.toLocaleString()} ta)
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <SupportStats stats={stats} />

      {/* Search & Tabs Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-dark-border dark:bg-dark-card sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Foydalanuvchi ismi, email yoki xabar matni bo'yicha qidirish..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
          />
        </form>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Barchasi', count: rawChatsCount },
            { id: 'unread', label: 'O‘qilmagan', count: stats.unreadChats },
            { id: 'online', label: 'Onlayn', count: stats.onlineUsers },
            { id: 'blocked', label: 'Bloklangan', count: stats.blockedUsers },
          ].map(t => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as FilterTab)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-finora-500 text-slate-950 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-dark-cardSecondary dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>{t.label}</span>
                {t.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9.5px] font-black ${
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Table container matching UsersPage */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-dark-border dark:bg-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Foydalanuvchi</th>
                <th className="px-5 py-3.5">Oxirgi xabar</th>
                <th className="px-5 py-3.5">Vaqti</th>
                <th className="px-5 py-3.5 text-center">O‘qilmagan</th>
                <th className="px-5 py-3.5">Holati</th>
                <th className="px-5 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-finora-500 border-t-transparent" />
                      <span>Murojaatlar yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : chats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-slate-100 p-3.5 text-slate-400 dark:bg-dark-cardSecondary">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Hech qanday murojaat topilmadi
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {search
                          ? `"${search}" qidiruvi bo‘yicha natija yo‘q`
                          : "Hozircha foydalanuvchilardan yangi murojaatlar kelib tushmagan"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                chats.map(c => {
                  const uid = c.user_id || c.id || 0
                  const userName = c.user_name || c.user_full_name || "Noma'lum"
                  const userEmail = c.user_email || ''
                  const unreadCount = c.admin_unread_count || 0
                  const isBlocked = !!c.is_blocked
                  const isOnline = !!c.is_user_online

                  return (
                    <tr
                      key={uid}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-dark-cardSecondary/50"
                    >
                      {/* User Column */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <UserAvatar
                              src={c.user_avatar_url || c.user_avatar}
                              name={userName}
                              email={userEmail}
                              size="md"
                            />
                            {isOnline && (
                              <span
                                title="Foydalanuvchi onlayn"
                                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-dark-card"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/support/${uid}`}
                                className="font-bold text-slate-900 hover:text-finora-600 dark:text-white dark:hover:text-finora-400"
                              >
                                {userName}
                              </Link>
                            </div>
                            <div className="truncate text-[11px] text-slate-400">
                              {userEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Last Message Column */}
                      <td className="px-5 py-3.5 max-w-xs">
                        <Link
                          to={`/support/${uid}`}
                          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                        >
                          {renderMessageTypeIcon(c.last_message_type)}
                          <span
                            className={`truncate text-xs ${
                              unreadCount > 0
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {c.last_sender_type === 'admin' && (
                              <span className="font-bold text-finora-600 dark:text-finora-400 mr-1">
                                Siz:
                              </span>
                            )}
                            {c.last_message_type === 'image'
                              ? '📷 Rasm'
                              : c.last_message_type === 'voice'
                              ? '🎙️ Ovozli xabar'
                              : c.last_message_text || 'Xabar mavjud'}
                          </span>
                        </Link>
                      </td>

                      {/* Time Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                        {c.last_message_at ? formatDate(c.last_message_at) : '—'}
                      </td>

                      {/* Unread Count Column */}
                      <td className="px-5 py-3.5 text-center">
                        {unreadCount > 0 ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-[10.5px] font-black text-white shadow-xs animate-pulse">
                            {unreadCount}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10.5px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                            <Ban className="h-3 w-3" /> Bloklangan
                          </span>
                        ) : isOnline ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Onlayn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-600 dark:bg-dark-cardSecondary dark:text-slate-300">
                            Oflayn
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Chat open button */}
                          <Link
                            to={`/support/${uid}`}
                            className="flex items-center gap-1 rounded-xl bg-finora-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-2xs hover:bg-finora-400 active:scale-95 transition-all"
                          >
                            <span>Chat</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>

                          {/* Block/Unblock */}
                          {isBlocked ? (
                            <button
                              onClick={() => handleUnblock(uid)}
                              title="Blokdan chiqarish"
                              className="rounded-xl border border-slate-200 p-1.5 text-emerald-600 hover:bg-emerald-50 dark:border-dark-border dark:hover:bg-slate-800 transition-colors"
                            >
                              <Unlock className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setBlockingChat(c)}
                              title="Supportdan bloklash"
                              className="rounded-xl border border-slate-200 p-1.5 text-rose-500 hover:bg-rose-50 dark:border-dark-border dark:hover:bg-slate-800 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Hide */}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Haqiqatan ham ${userName} suhbatini admin ro'yxatidan yashirmoqchimisiz?`
                                )
                              ) {
                                handleHide(uid)
                              }
                            }}
                            title="Chatni yashirish"
                            className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:border-dark-border dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block User Dialog Modal */}
      {blockingChat && (
        <BlockUserModal
          isOpen={!!blockingChat}
          userName={blockingChat.user_name || blockingChat.user_full_name || "Foydalanuvchi"}
          onClose={() => setBlockingChat(null)}
          onConfirm={async reason => {
            const uid = blockingChat.user_id || blockingChat.id || 0
            await handleBlock(uid, reason)
          }}
        />
      )}
    </div>
  )
}
