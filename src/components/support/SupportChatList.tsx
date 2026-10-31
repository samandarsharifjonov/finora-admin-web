import React from 'react'
import {
  Search,
  RefreshCw,
  MessageSquare,
  Radio,
  Megaphone,
  Loader2,
} from 'lucide-react'
import type { SupportChat, SupportStatsSummary } from '../../types/support'
import type { FilterTab } from '../../hooks/useSupportChats'
import { SupportChatListItem } from './SupportChatListItem'

interface SupportChatListProps {
  chats: SupportChat[]
  activeUserId: number | null
  rawChatsCount: number
  total?: number
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  stats: SupportStatsSummary
  search: string
  onSearchChange: (q: string) => void
  tab: FilterTab
  onTabChange: (tab: FilterTab) => void
  socketStatus: string
  refreshing: boolean
  onRefresh: () => void
  onSelectChat: (userId: number) => void
  onOpenBroadcast: () => void
}

export const SupportChatList: React.FC<SupportChatListProps> = ({
  chats,
  activeUserId,
  rawChatsCount,
  total,
  hasMore,
  loadingMore,
  onLoadMore,
  stats,
  search,
  onSearchChange,
  tab,
  onTabChange,
  socketStatus,
  refreshing,
  onRefresh,
  onSelectChat,
  onOpenBroadcast,
}) => {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 150 && hasMore && !loadingMore && onLoadMore) {
      onLoadMore()
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
            {/* Broadcast Button */}
            <button
              onClick={onOpenBroadcast}
              title="Barcha foydalanuvchilar chatiga umumiy xabar yuborish"
              className="flex items-center gap-1.5 rounded-lg bg-finora-600 hover:bg-finora-700 px-2 py-1 text-[11px] font-bold text-white shadow-2xs transition-colors shrink-0"
            >
              <Megaphone className="h-3 w-3" />
              <span className="hidden sm:inline">Umumiy xabar</span>
            </button>

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
              <span className="hidden lg:inline">
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
            { id: 'all', label: 'Barchasi', count: total || rawChatsCount },
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
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5"
      >
        {chats.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center p-4 text-center text-slate-400">
            <MessageSquare className="h-6 w-6 mb-1 opacity-50" />
            <span className="text-xs font-semibold">Murojaat topilmadi</span>
          </div>
        ) : (
          chats.map(c => {
            const uid = c.user_id || c.id || 0
            const isActive = activeUserId === uid

            return (
              <SupportChatListItem
                key={uid}
                chat={c}
                isActive={isActive}
                onSelect={onSelectChat}
              />
            )
          })
        )}

        {loadingMore && (
          <div className="flex items-center justify-center py-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-finora-600 dark:text-finora-400 mr-2" />
            <span className="text-xs font-medium">Yana yuklanmoqda...</span>
          </div>
        )}

        {hasMore && !loadingMore && (
          <div className="pt-1 pb-2">
            <button
              type="button"
              onClick={onLoadMore}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 transition-colors shadow-2xs"
            >
              Ko'proq yuklash ({chats.length} / {total || chats.length})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
