import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageSquare, ShieldCheck, Sparkles, Headphones, Megaphone } from 'lucide-react'
import { useSupportChats } from '../hooks/useSupportChats'
import { SupportChatList } from '../components/support/SupportChatList'
import { SupportChatView } from '../components/support/SupportChatView'
import { BroadcastSupportModal } from '../components/support/BroadcastSupportModal'

export const SupportPage: React.FC = () => {
  const { userId: rawUserId } = useParams<{ userId?: string }>()
  const navigate = useNavigate()
  const activeUserId = rawUserId ? Number(rawUserId) : null
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false)

  const {
    chats,
    rawChatsCount,
    total,
    hasMore,
    loadingMore,
    loadMore,
    stats,
    refreshing,
    search,
    setSearch,
    tab,
    setTab,
    socketStatus,
    refresh,
  } = useSupportChats()

  const handleSelectChat = (uid: number) => {
    navigate(`/support/${uid}`)
  }

  const handleBackToList = () => {
    navigate('/support')
  }

  return (
    <div className="flex flex-col">
      {/* Outer split container with fixed viewport height to prevent header clipping */}
      <div className="flex h-[calc(100vh-7.5rem)] sm:h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-9.5rem)] w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card">
        {/* Left Side: Users list */}
        <div
          className={`h-full w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200/80 dark:border-dark-border ${
            activeUserId ? 'hidden md:flex' : 'flex'
          } flex-col overflow-hidden`}
        >
          <SupportChatList
            chats={chats}
            activeUserId={activeUserId}
            rawChatsCount={rawChatsCount}
            total={total}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            stats={stats}
            search={search}
            onSearchChange={setSearch}
            tab={tab}
            onTabChange={setTab}
            socketStatus={socketStatus}
            refreshing={refreshing}
            onRefresh={refresh}
            onSelectChat={handleSelectChat}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
          />
        </div>

        {/* Right Side: Active Chat or Empty Placeholder */}
        <div
          className={`h-full flex-1 min-w-0 ${
            !activeUserId ? 'hidden md:flex' : 'flex'
          } flex-col overflow-hidden`}
        >
          {activeUserId ? (
            <SupportChatView
              key={activeUserId}
              userId={activeUserId}
              onBack={handleBackToList}
              onChatHidden={handleBackToList}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-slate-50/40 dark:bg-dark-card/40">
              <div className="relative mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-finora-500/15 text-finora-600 dark:text-finora-400 border border-finora-500/30 shadow-inner">
                  <Headphones className="h-8 w-8" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Murojaatni tanlang
              </h3>
              <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Foydalanuvchi bilan jonli muloqotni boshlash, xabarlar tarixini ko'rish va javob qaytarish uchun chap tarafdagi ro'yxatdan birorta suhbat ustiga bosing.
              </p>

              <button
                type="button"
                onClick={() => setIsBroadcastOpen(true)}
                className="mt-4 flex items-center gap-2 rounded-xl bg-finora-600 hover:bg-finora-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <Megaphone className="h-4 w-4" />
                <span>Barchaga umumiy xabar yuborish</span>
              </button>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-2xs dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300">
                  <MessageSquare className="h-3.5 w-3.5 text-finora-600" />
                  <span>Jami suhbatlar: {stats.totalChats}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-2xs dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Real-time himoya</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Support Modal */}
      <BroadcastSupportModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onSuccess={() => {
          refresh()
        }}
      />
    </div>
  )
}
