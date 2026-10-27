import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw, MessageSquare } from 'lucide-react'
import { useChatMessages } from '../hooks/useChatMessages'
import { ChatHeader } from '../components/support/ChatHeader'
import { ChatBubble } from '../components/support/ChatBubble'
import { ChatInput } from '../components/support/ChatInput'
import { ImagePreviewModal } from '../components/support/ImagePreviewModal'
import { BlockUserModal } from '../components/support/BlockUserModal'
import { blockSupportUser, unblockSupportUser, hideChatForAdmin } from '../lib/supportApi'

export const SupportChatPage: React.FC = () => {
  const { userId: rawUserId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const userId = Number(rawUserId) || 0

  const {
    chat,
    setChat,
    messages,
    loading,
    error,
    isUserTyping,
    isUserOnline,
    replyingTo,
    setReplyingTo,
    socketStatus,
    messagesEndRef,
    sendMessage,
    deleteMessage,
    editMessage,
    reloadChat,
    notifyTyping,
  } = useChatMessages({ userId })

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showBlockModal, setShowBlockModal] = useState(false)

  const handleBlockConfirm = async (reason: string) => {
    await blockSupportUser(userId, reason)
    setChat(prev => (prev ? { ...prev, is_blocked: true, blocked_reason: reason } : null))
  }

  const handleUnblock = async () => {
    if (confirm("Foydalanuvchini blokdan chiqarmoqchimisiz?")) {
      await unblockSupportUser(userId)
      setChat(prev => (prev ? { ...prev, is_blocked: false, blocked_reason: null } : null))
    }
  }

  const handleHideChat = async () => {
    await hideChatForAdmin(userId)
    navigate('/support')
  }

  // Sanalar bo'yicha ajratish helperi
  const formatGroupDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      if (d.toDateString() === today.toDateString()) return 'Bugun'
      if (d.toDateString() === yesterday.toDateString()) return 'Kecha'

      return d.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      })
    } catch {
      return ''
    }
  }

  // Xabarlarni sanalar bo'yicha guruhlash
  const renderedMessagesWithDates: React.ReactNode[] = []
  let lastDate = ''

  messages.forEach(msg => {
    const msgDate = formatGroupDate(msg.created_at)
    if (msgDate && msgDate !== lastDate) {
      lastDate = msgDate
      renderedMessagesWithDates.push(
        <div key={`date-${msg.created_at}-${msg.id}`} className="flex justify-center my-4">
          <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[10.5px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 shadow-2xs select-none">
            {msgDate}
          </span>
        </div>
      )
    }

    renderedMessagesWithDates.push(
      <ChatBubble
        key={msg.id}
        message={msg}
        userName={chat?.user_name || chat?.user_full_name || 'Foydalanuvchi'}
        userAvatar={chat?.user_avatar_url || chat?.user_avatar}
        onImageClick={url => setPreviewImage(url)}
        onReply={m => setReplyingTo(m)}
        onDelete={id => deleteMessage(id)}
        onEdit={(id, newText) => editMessage(id, newText)}
      />
    )
  })

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col rounded-2xl border border-slate-200/80 bg-slate-50/50 shadow-sm dark:border-dark-border dark:bg-dark-card/50 overflow-hidden">
      {/* Top Header */}
      <ChatHeader
        chat={chat}
        isOnline={isUserOnline}
        isTyping={isUserTyping}
        socketStatus={socketStatus}
        onBack={() => navigate('/support')}
        onOpenBlockModal={() => setShowBlockModal(true)}
        onUnblock={handleUnblock}
        onHideChat={handleHideChat}
      />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-finora-500 border-t-transparent" />
            <span className="text-xs">Suhbat xabarlari yuklanmoqda...</span>
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-950">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">{error}</p>
            <button
              onClick={reloadChat}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Qaytadan urinish
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-dark-cardSecondary text-slate-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Hali xabarlar mavjud emas
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Muloqotni boshlash uchun quyidagi maydonga xabar yozing yoki tezkor shablonlardan foydalaning.
            </p>
          </div>
        ) : (
          <>
            {renderedMessagesWithDates}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing indicator bar if user is currently typing */}
      {isUserTyping && (
        <div className="px-5 py-1.5 text-[11px] font-semibold text-finora-600 dark:text-finora-400 flex items-center gap-1.5 bg-slate-100/70 dark:bg-dark-cardSecondary/60 border-t border-slate-200/50 dark:border-dark-border/50">
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
          </span>
          <span>{chat?.user_name || 'Foydalanuvchi'} xabar yozmoqda...</span>
        </div>
      )}

      {/* Bottom Chat Input */}
      <div className="p-3 sm:p-4 bg-white/90 dark:bg-dark-card/90 border-t border-slate-200/80 dark:border-dark-border backdrop-blur-md">
        <ChatInput
          onSendMessage={sendMessage}
          isBlocked={!!chat?.is_blocked}
          blockedReason={chat?.blocked_reason}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onTyping={notifyTyping}
        />
      </div>

      {/* Lightbox Image Preview Modal */}
      <ImagePreviewModal
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      {/* Block User Modal */}
      {showBlockModal && (
        <BlockUserModal
          isOpen={showBlockModal}
          userName={chat?.user_name || chat?.user_full_name || 'Foydalanuvchi'}
          onClose={() => setShowBlockModal(false)}
          onConfirm={handleBlockConfirm}
        />
      )}
    </div>
  )
}
