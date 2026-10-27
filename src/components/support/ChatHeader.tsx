import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Ban,
  Unlock,
  Trash2,
} from 'lucide-react'
import type { SupportChat } from '../../types/support'
import { UserAvatar } from '../common/UserAvatar'
import { formatDate } from '../../lib/utils'

interface ChatHeaderProps {
  chat: SupportChat | null
  isOnline: boolean
  isTyping: boolean
  socketStatus: string
  onBack: () => void
  onOpenBlockModal: () => void
  onUnblock: () => void
  onHideChat: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  isOnline,
  isTyping,
  socketStatus,
  onBack,
  onOpenBlockModal,
  onUnblock,
  onHideChat,
}) => {
  const userName = chat?.user_name || chat?.user_full_name || 'Foydalanuvchi'
  const userEmail = chat?.user_email || ''
  const userId = chat?.user_id || 0
  const isBlocked = !!chat?.is_blocked

  return (
    <div className="flex items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/95 sm:px-6">
      {/* Left: Back button + User preview */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Murojaatlar ro'yxatiga qaytish"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative shrink-0">
          <UserAvatar
            src={chat?.user_avatar_url || chat?.user_avatar}
            name={userName}
            email={userEmail}
            size="md"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-dark-card" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {userName}
            </h2>
            {isBlocked && (
              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9.5px] font-bold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                Bloklangan
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {isTyping ? (
              <span className="flex items-center gap-1 font-semibold text-finora-600 dark:text-finora-400 animate-pulse">
                <span>yozmoqda</span>
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce" />
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                </span>
              </span>
            ) : isOnline ? (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Tarmoqda (Onlayn)
              </span>
            ) : (
              <span className="truncate text-slate-400">
                {chat?.user_last_seen_at
                  ? `Oxirgi faollik: ${formatDate(chat.user_last_seen_at)}`
                  : userEmail}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions & Socket indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Realtime WebSocket pill */}
        <div
          title={
            socketStatus === 'connected'
              ? 'Real-vaqtda WebSocket ulangan'
              : 'Zaxira foniy sinxronizatsiya rejimi'
          }
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[10.5px] font-semibold text-slate-600 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300"
        >
          {socketStatus === 'connected' ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Sinxron</span>
            </>
          )}
        </div>

        {/* View Profile Link */}
        {userId > 0 && (
          <Link
            to={`/users/${userId}`}
            title="Foydalanuvchi profili va tranzaksiyalarini ko'rish"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Profil</span>
          </Link>
        )}

        {/* Block / Unblock Button */}
        {isBlocked ? (
          <button
            onClick={onUnblock}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
          >
            <Unlock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Blokdan chiqarish</span>
          </button>
        ) : (
          <button
            onClick={onOpenBlockModal}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
          >
            <Ban className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bloklash</span>
          </button>
        )}

        {/* Hide / Delete from Admin list */}
        <button
          onClick={() => {
            if (
              confirm(
                "Ushbu chatni admin ro'yxatidan o'chirmoqchimisiz? (Foydalanuvchi yana yozsa, avtomatik qaytadi)"
              )
            ) {
              onHideChat()
            }
          }}
          title="Chatni ro'yxatdan yashirish"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
