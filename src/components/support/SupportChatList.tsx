import React from 'react'
import {
  Search,
  RefreshCw,
  Image as ImageIcon,
  Mic,
  MessageSquare,
  Ban,
  Radio,
} from 'lucide-react'
import type { SupportChat, SupportStatsSummary } from '../../types/support'
import type { FilterTab } from '../../hooks/useSupportChats'
import { UserAvatar } from '../common/UserAvatar'
import { formatDate } from '../../lib/utils'

interface SupportChatListProps {
  chats: SupportChat[]
  activeUserId: number | null
  rawChatsCount: number
  stats: SupportStatsSummary
  search: string
  onSearchChange: (q: string) => void
  tab: FilterTab
  onTabChange: (tab: FilterTab) => void
  socketStatus: string
  refreshing: boolean
  onRefresh: () => void
  onSelectChat: (userId: number) => void
}

export const SupportChatList: React.FC<SupportChatListProps> = ({
  chats,
  activeUserId,
  rawChatsCount,
  stats,
  search,
  onSearchChange,
  tab,
  onTabChange,
  socketStatus,
  refreshing,
  onRefresh,
  onSelectChat,
}) => {
  const renderMessageIcon = (type: string, isActive: boolean) => {
    const iconClass = `h-3.5 w-3.5 shrink-0 ${
      isActive ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'
    }`
    switch (type) {
      case 'image':
        return <ImageIcon className={iconClass} />
      case 'voice':
        return <Mic className={iconClass} />
      default:
        return <MessageSquare className={iconClass} />
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50/70 dark:bg-dark-card/50">
      {/* Top Header */}
      <div className="shrink-0 border-b border-slate-200/80 bg-white/95 p-3.5 dark:border-dark-border dark:bg-dark-card/95">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              Murojaatlar
            </h2>
            {stats.unreadChats > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white animate-pulse">
                {stats.unreadChats}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Live Socket badge */}
            <span
              title={socketStatus === 'connected' ? 'Real-time WebSocket ulangan' : 'Sinxron rejim'}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                socketStatus === 'connected'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              <Radio className={`h-3 w-3 ${socketStatus === 'connected' ? 'animate-pulse text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">
                {socketStatus === 'connected' ? 'Jonli' : 'Sinxron'}
              </span>
            </span>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Yangilash"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-2.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Qidirish (ism, email, xabar)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-8 pr-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-2 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
          />
        </div>

        {/* Filter Tab Pills */}
        <div className="mt-2.5 flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: 'all', label: 'Barchasi', count: rawChatsCount },
            { id: 'unread', label: 'Yangi', count: stats.unreadChats },
            { id: 'online', label: 'Onlayn', count: stats.onlineUsers },
            { id: 'blocked', label: 'Blok', count: stats.blockedUsers },
          ].map(t => {
            const isTabActive = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id as FilterTab)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  isTabActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-dark-cardSecondary dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span>{t.label}</span>
                {t.count > 0 && (
                  <span
                    className={`rounded-full px-1 text-[9px] font-black ${
                      isTabActive
                        ? 'bg-finora-500 text-slate-950'
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

      {/* Scrollable User Items */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5">
        {chats.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center p-4 text-center text-slate-400">
            <MessageSquare className="h-6 w-6 mb-1 opacity-50" />
            <span className="text-xs font-semibold">Murojaat topilmadi</span>
          </div>
        ) : (
          chats.map(c => {
            const uid = c.user_id || c.id || 0
            const isActive = activeUserId === uid
            const userName = c.user_name || c.user_full_name || "Noma'lum"
            const userEmail = c.user_email || ''
            const unreadCount = c.admin_unread_count || 0
            const isBlocked = !!c.is_blocked
            const isOnline = !!c.is_user_online

            return (
              <div
                key={uid}
                onClick={() => onSelectChat(uid)}
                className={`group relative flex items-start gap-3 rounded-2xl p-3 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-finora-500 text-slate-950 font-bold shadow-md shadow-finora-500/20 ring-2 ring-finora-500/50 border border-finora-600'
                    : 'bg-white dark:bg-dark-cardSecondary/60 hover:bg-slate-50 dark:hover:bg-dark-cardSecondary border border-slate-200/70 dark:border-dark-border/80'
                }`}
              >
                {/* User avatar + online status */}
                <div className="relative shrink-0 mt-0.5">
                  <UserAvatar
                    src={c.user_avatar_url || c.user_avatar}
                    name={userName}
                    email={userEmail}
                    size="md"
                  />
                  {isOnline && (
                    <span
                      title="Onlayn"
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
                        isActive ? 'border-finora-500 bg-slate-950' : 'border-white bg-emerald-500 dark:border-dark-card'
                      }`}
                    />
                  )}
                </div>

                {/* Info & Last message */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <h3
                      className={`truncate text-xs ${
                        isActive
                          ? 'font-black text-slate-950'
                          : 'font-bold text-slate-900 dark:text-white'
                      }`}
                    >
                      {userName}
                    </h3>
                    <span
                      className={`shrink-0 text-[10px] ${
                        isActive ? 'text-slate-950/70 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {c.last_message_at ? formatDate(c.last_message_at) : ''}
                    </span>
                  </div>

                  {/* Last message text preview */}
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <div
                      className={`flex items-center gap-1 truncate text-[11.5px] ${
                        isActive
                          ? 'text-slate-950/90 font-medium'
                          : unreadCount > 0
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {renderMessageIcon(c.last_message_type, isActive)}
                      <span className="truncate">
                        {c.last_sender_type === 'admin' && (
                          <span className={isActive ? 'font-black mr-1' : 'font-bold text-finora-600 dark:text-finora-400 mr-1'}>
                            Siz:
                          </span>
                        )}
                        {c.last_message_type === 'image'
                          ? 'Rasm'
                          : c.last_message_type === 'voice'
                          ? 'Ovozli xabar'
                          : c.last_message_text || 'Xabar mavjud'}
                      </span>
                    </div>

                    {/* Badge or indicator */}
                    <div className="shrink-0 flex items-center gap-1">
                      {isBlocked && (
                        <span
                          title="Bloklangan"
                          className={`rounded px-1 py-0.2 text-[9px] font-black ${
                            isActive
                              ? 'bg-slate-950 text-white'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          <Ban className="h-2.5 w-2.5 inline" />
                        </span>
                      )}

                      {unreadCount > 0 && (
                        <span
                          className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9.5px] font-black ${
                            isActive
                              ? 'bg-slate-950 text-white'
                              : 'bg-rose-500 text-white animate-pulse'
                          }`}
                        >
                          {unreadCount}
                        </span>
                      )}

                      {isActive && (
                        <span className="rounded bg-slate-950 text-white px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider">
                          FAOL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
