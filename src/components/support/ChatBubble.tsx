import React, { useState } from 'react'
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  CornerUpLeft,
  Trash2,
  Edit2,
  Play,
  Pause,
} from 'lucide-react'
import type { SupportMessage } from '../../types/support'
import { UserAvatar } from '../common/UserAvatar'

interface ChatBubbleProps {
  message: SupportMessage
  userName: string
  userAvatar?: string | null
  onImageClick: (url: string) => void
  onReply: (message: SupportMessage) => void
  onDelete?: (messageId: number) => void
  onEdit?: (messageId: number, newText: string) => void
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  userName,
  userAvatar,
  onImageClick,
  onReply,
  onDelete,
  onEdit,
}) => {
  const isAdmin = message.sender_type === 'admin'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.text)

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const toggleAudio = (url: string) => {
    if (!audioRef) {
      const a = new Audio(url)
      a.onended = () => setIsPlayingAudio(false)
      a.play()
      setAudioRef(a)
      setIsPlayingAudio(true)
    } else {
      if (isPlayingAudio) {
        audioRef.pause()
        setIsPlayingAudio(false)
      } else {
        audioRef.play()
        setIsPlayingAudio(true)
      }
    }
  }

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit?.(message.id, editText.trim())
    }
    setIsEditing(false)
  }

  return (
    <div
      className={`group flex items-end gap-2.5 my-2.5 ${
        isAdmin ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* User avatar on the left */}
      {!isAdmin && (
        <div className="shrink-0 mb-1">
          <UserAvatar src={userAvatar} name={userName} size="sm" />
        </div>
      )}

      {/* Bubble container */}
      <div
        className={`relative max-w-[82%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl p-3 shadow-xs transition-all ${
          isAdmin
            ? 'rounded-br-xs bg-finora-500 text-slate-950 font-medium'
            : 'rounded-bl-xs border border-slate-200/80 bg-white text-slate-900 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white'
        }`}
      >
        {/* Reply preview if quoted */}
        {message.reply_to_message && (
          <div
            className={`mb-2 rounded-lg border-l-3 px-2.5 py-1 text-[11px] ${
              isAdmin
                ? 'border-slate-900/40 bg-slate-950/10 text-slate-900'
                : 'border-finora-500 bg-slate-50 dark:bg-dark-card text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className="font-bold block text-[10px]">
              {message.reply_to_message.sender_name || 'Xabar'}
            </span>
            <p className="truncate line-clamp-1">{message.reply_to_message.text}</p>
          </div>
        )}

        {/* Image attachment */}
        {message.media_url && message.message_type === 'image' && (
          <div className="mb-2 overflow-hidden rounded-xl">
            <img
              src={message.media_url}
              alt="Biriktirilgan rasm"
              onClick={() => onImageClick(message.media_url!)}
              className="max-h-64 w-full cursor-pointer object-cover rounded-xl transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>
        )}

        {/* Voice Note audio */}
        {message.media_url && message.message_type === 'voice' && (
          <div
            className={`mb-1.5 flex items-center gap-3 rounded-xl p-2.5 ${
              isAdmin ? 'bg-black/10' : 'bg-slate-100 dark:bg-dark-card'
            }`}
          >
            <button
              onClick={() => toggleAudio(message.media_url!)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform active:scale-95 ${
                isAdmin
                  ? 'bg-slate-950 text-white'
                  : 'bg-finora-500 text-slate-950 font-bold'
              }`}
            >
              {isPlayingAudio ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold">Ovozli xabar</span>
                {message.media_duration ? (
                  <span className="text-[10px] opacity-75">
                    ({message.media_duration} soniya)
                  </span>
                ) : null}
              </div>
              {/* Waveform indicator */}
              <div className="flex items-center gap-0.5 mt-1 h-3">
                {[40, 70, 30, 90, 60, 45, 80, 50, 65, 35, 85, 40].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full ${
                      isAdmin ? 'bg-slate-950/40' : 'bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Text / Edit View */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full rounded-lg bg-white p-2 text-xs text-slate-900 outline-none"
              rows={2}
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded px-2 py-0.5 text-[10px] font-bold bg-black/10 hover:bg-black/20"
              >
                Bekor
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded px-2 py-0.5 text-[10px] font-bold bg-black text-white"
              >
                Saqlash
              </button>
            </div>
          </div>
        ) : (
          message.text && (
            <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
              {message.text}
            </p>
          )
        )}

        {/* Meta info: Time, Status, Edited */}
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[9.5px] select-none ${
            isAdmin ? 'text-slate-950/70' : 'text-slate-400'
          }`}
        >
          {message.is_edited && <span>(tahrirlandi)</span>}
          <span>{formatTime(message.created_at)}</span>

          {/* Status icon for Admin */}
          {isAdmin && (
            <>
              {message.is_sending ? (
                <Clock className="h-3 w-3 animate-spin" />
              ) : message.has_error ? (
                <span title="Yuborilmadi">
                  <AlertCircle className="h-3 w-3 text-rose-700" />
                </span>
              ) : message.is_read ? (
                <span title="O‘qildi">
                  <CheckCheck className="h-3.5 w-3.5 text-slate-950 font-bold" />
                </span>
              ) : (
                <span title="Yetkazildi">
                  <Check className="h-3.5 w-3.5 text-slate-950/70" />
                </span>
              )}
            </>
          )}
        </div>

        {/* Quick Reactions Display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {message.reactions.map((r, i) => (
              <span
                key={i}
                className="rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-[10px]"
              >
                {r.reaction} {r.count > 1 ? r.count : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons on Hover */}
      <div
        className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 ${
          isAdmin ? 'order-first' : ''
        }`}
      >
        <button
          onClick={() => onReply(message)}
          className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title="Javob berish"
        >
          <CornerUpLeft className="h-3.5 w-3.5" />
        </button>

        {isAdmin && !message.is_sending && (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Tahrirlash"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm("Ushbu xabarni o'chirmoqchimisiz?")) {
                  onDelete?.(message.id)
                }
              }}
              className="rounded-lg p-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              title="O‘chirish"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
