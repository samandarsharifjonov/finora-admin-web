import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Paperclip,
  Sparkles,
  X,
  Loader2,
  Lock,
} from 'lucide-react'
import type { SupportMessage, SendMessagePayload } from '../../types/support'
import { uploadSupportMedia } from '../../lib/supportApi'
import { QuickRepliesModal } from './QuickRepliesModal'

interface ChatInputProps {
  onSendMessage: (payload: SendMessagePayload) => Promise<void>
  isBlocked: boolean
  blockedReason?: string | null
  replyingTo: SupportMessage | null
  onCancelReply: () => void
  onTyping: (isTyping: boolean) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isBlocked,
  blockedReason,
  replyingTo,
  onCancelReply,
  onTyping,
}) => {
  const [text, setText] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-focus input
  useEffect(() => {
    if (!isBlocked) {
      inputRef.current?.focus()
    }
  }, [isBlocked, replyingTo])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)

    // Typing debounce
    onTyping(true)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      onTyping(false)
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadSupportMedia(file)
      setMediaUrl(res.url)
    } catch (err: any) {
      alert(err?.message || "Fayl yuklashda xatolik yuz berdi")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSend = async () => {
    if ((!text.trim() && !mediaUrl) || isBlocked || sending || uploading) return

    setSending(true)
    try {
      await onSendMessage({
        text: text.trim(),
        media_url: mediaUrl || undefined,
        message_type: mediaUrl ? 'image' : 'text',
        reply_to_message_id: replyingTo?.id,
      })
      setText('')
      setMediaUrl(null)
      onTyping(false)
    } catch (err: any) {
      alert(err?.message || "Xabar yuborishda xatolik")
    } finally {
      setSending(false)
    }
  }

  if (isBlocked) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200/80 bg-rose-50/80 p-4 text-xs font-semibold text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
        <Lock className="h-4 w-4 shrink-0 text-rose-600" />
        <span>
          Foydalanuvchi bloklangan {blockedReason ? `("${blockedReason}")` : ''}. Xabar yoza olmaysiz.
        </span>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-dark-border dark:bg-dark-card transition-all focus-within:border-finora-500/80 focus-within:ring-4 focus-within:ring-finora-500/10">
      {/* Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs dark:border-dark-border dark:bg-dark-cardSecondary/60 rounded-t-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-finora-600 dark:text-finora-400">
              Javob berilmoqda:
            </span>
            <span className="truncate text-slate-600 dark:text-slate-300">
              {replyingTo.text || 'Media fayl'}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Media Attachment Preview */}
      {mediaUrl && (
        <div className="flex items-center gap-2 border-b border-slate-100 p-3 dark:border-dark-border">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 dark:border-dark-border">
            <img
              src={mediaUrl}
              alt="Yuklangan rasm"
              className="h-full w-full object-cover"
            />
            <button
              onClick={() => setMediaUrl(null)}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Rasm biriktirildi
          </span>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 p-2.5 sm:p-3">
        {/* Quick replies & attach buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowQuickReplies(true)}
            title="Tezkor shablon javoblar"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-dark-cardSecondary dark:hover:text-slate-200 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Rasm yuklash"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-dark-cardSecondary dark:hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-finora-600" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Xabaringizni yozing... (Enter — jo'natish, Shift+Enter — yangi qator)"
          rows={1}
          className="min-h-[38px] max-h-32 flex-1 resize-none bg-transparent py-2 px-1 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && !mediaUrl) || sending || uploading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-finora-500 text-slate-950 font-bold shadow-sm transition-all hover:bg-finora-400 active:scale-95 disabled:opacity-40 disabled:hover:bg-finora-500 disabled:active:scale-100"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 ml-0.5" />
          )}
        </button>
      </div>

      {/* Quick Replies Dialog */}
      <QuickRepliesModal
        isOpen={showQuickReplies}
        onClose={() => setShowQuickReplies(false)}
        onSelect={selectedText => {
          setText(prev => (prev ? `${prev} ${selectedText}` : selectedText))
          inputRef.current?.focus()
        }}
      />
    </div>
  )
}
