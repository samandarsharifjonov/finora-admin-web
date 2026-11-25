import React from 'react'
import {
  Image as ImageIcon,
  Mic,
  MessageSquare,
  Ban,
} from 'lucide-react'
import type { SupportChat } from '../../types/support'
import { UserAvatar } from '../common/UserAvatar'
import { formatDate } from '../../lib/utils'

interface SupportChatListItemProps {
  chat: SupportChat
  isActive: boolean
  onSelect: (userId: number) => void
}

export const SupportChatListItem: React.FC<SupportChatListItemProps> = ({
  chat,
  isActive,
  onSelect,
}) => {
  const uid = chat.user_id || chat.id || 0
  const userName = chat.user_name || chat.user_full_name || "Noma'lum"
  const userEmail = chat.user_email || ''
  const unreadCount = chat.admin_unread_count || 0
  const isBlocked = !!chat.is_blocked
  const isOnline = !!chat.is_user_online

  const renderMessageIcon = (type: string) => {
    const iconClass = 'h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500'
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
    <div
      onClick={() => onSelect(uid)}
      className={`group relative flex items-start gap-3 rounded-2xl p-3 transition-colors cursor-pointer ${
        isActive
          ? 'border-2 border-finora-500 bg-finora-500/[0.06] dark:bg-finora-500/[0.08]'
          : 'border border-slate-200/70 bg-white hover:bg-slate-50 dark:border-dark-border/80 dark:bg-dark-cardSecondary/60 dark:hover:bg-dark-cardSecondary'
      }`}
    >
      {/* User avatar + online indicator */}
      <div className="relative shrink-0 mt-0.5">
        <UserAvatar
          src={chat.user_avatar_url || chat.user_avatar}
          name={userName}
          email={userEmail}
          size="md"
        />
        {isOnline && (
          <span
            title="Onlayn"
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-dark-card"
          />
        )}
      </div>

      {/* Info & Last message */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <h3 className="truncate text-xs font-bold text-slate-900 dark:text-white">
            {userName}
          </h3>
          <span className="shrink-0 text-[10px] tabular-nums text-slate-400">
            {chat.last_message_at ? formatDate(chat.last_message_at) : ''}
          </span>
        </div>

        {/* Last message text preview */}
        <div className="mt-1 flex items-center justify-between gap-1">
          <div
            className={`flex items-center gap-1 truncate text-[11.5px] ${
              unreadCount > 0
                ? 'font-bold text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {renderMessageIcon(chat.last_message_type)}
            <span className="truncate">
              {chat.last_sender_type === 'admin' && (
                <span className="mr-1 font-bold text-finora-600 dark:text-finora-400">
                  Siz:
                </span>
              )}
              {chat.last_message_type === 'image'
                ? 'Rasm'
                : chat.last_message_type === 'voice'
                ? 'Ovozli xabar'
                : chat.last_message_text || 'Xabar mavjud'}
            </span>
          </div>

          {/* Badge or status indicators */}
          <div className="shrink-0 flex items-center gap-1">
            {isBlocked && (
              <span
                title="Bloklangan"
                className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              >
                <Ban className="h-2.5 w-2.5 inline" />
              </span>
            )}

            {unreadCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9.5px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
