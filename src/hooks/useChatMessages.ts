import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchAdminChatDetail,
  sendAdminMessage,
  markChatAsRead,
  deleteAdminMessage,
  editAdminMessage,
} from '../lib/supportApi'
import type { SupportChat, SupportMessage, SendMessagePayload } from '../types/support'
import { useSupportSocket } from './useSupportSocket'

interface UseChatMessagesProps {
  userId: number
}

export function useChatMessages({ userId }: UseChatMessagesProps) {
  const [chat, setChat] = useState<SupportChat | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [isUserOnline, setIsUserOnline] = useState(false)
  const [replyingTo, setReplyingTo] = useState<SupportMessage | null>(null)

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Xabarlar oxiriga silliq skroll qilish
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      })
    })
  }, [])

  // Chat va xabarlar tarixini yuklash
  const loadChat = useCallback(
    async (isSilent = false) => {
      if (!userId) return
      if (!isSilent) setLoading(true)
      setError(null)

      try {
        const detail = await fetchAdminChatDetail(userId)
        if (detail.chat) {
          setChat(detail.chat)
          setIsUserOnline(!!detail.chat.is_user_online || !!detail.is_user_online)
        }
        setMessages(detail.messages || [])

        // O'qildi deb belgilash
        markChatAsRead(userId)

        if (!isSilent) {
          setTimeout(() => scrollToBottom(false), 80)
        }
      } catch (err: any) {
        setError(err?.message || "Suhbatni yuklashda xatolik yuz berdi")
      } finally {
        if (!isSilent) setLoading(false)
      }
    },
    [userId, scrollToBottom]
  )

  useEffect(() => {
    loadChat(false)
  }, [loadChat])

  // WebSocket orqali yangi xabar kelganda
  const handleNewMessage = useCallback(
    (newMsg: SupportMessage, msgUserId: number) => {
      if (msgUserId === userId || newMsg.sender_id === userId) {
        setMessages(prev => {
          // Takroriy xabar bo'lsa qo'shmaslik
          if (prev.some(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        markChatAsRead(userId)
        scrollToBottom(true)
      }
    },
    [userId, scrollToBottom]
  )

  // Foydalanuvchi "yozmoqda..." holati
  const handleTyping = useCallback(
    (event: { userId: number; isTyping: boolean; senderType: string }) => {
      if (event.userId === userId && event.senderType === 'user') {
        setIsUserTyping(event.isTyping)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        if (event.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsUserTyping(false)
          }, 4000)
        }
      }
    },
    [userId]
  )

  // Foydalanuvchi onlayn holati
  const handleUserStatus = useCallback(
    (event: { userId: number; isOnline: boolean }) => {
      if (event.userId === userId) {
        setIsUserOnline(event.isOnline)
        setChat(prev => (prev ? { ...prev, is_user_online: event.isOnline } : null))
      }
    },
    [userId]
  )

  const { status: socketStatus, enterChat, leaveChat, sendTyping } = useSupportSocket({
    onNewMessage: handleNewMessage,
    onTyping: handleTyping,
    onUserStatus: handleUserStatus,
  })

  // Ushbu chat xonasiga kirish / chiqish
  useEffect(() => {
    if (userId) {
      enterChat(userId)
    }
    return () => {
      leaveChat()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [userId, enterChat, leaveChat])

  // Foniy 6 soniyalik polling (WebSocket bilan birgalikda to'liq ishonchlilik uchun)
  useEffect(() => {
    const timer = setInterval(() => {
      loadChat(true)
    }, 6000)
    return () => clearInterval(timer)
  }, [loadChat])

  // Xabar yuborish (Optimistik UI bilan)
  const sendMessage = async (payload: SendMessagePayload) => {
    if (!payload.text.trim() && !payload.media_url) return

    const tempId = -Date.now()
    const optimisticMsg: SupportMessage = {
      id: tempId,
      chat_id: chat?.id || 0,
      sender_id: 0,
      sender_type: 'admin',
      message_type: payload.message_type || (payload.media_url ? 'image' : 'text'),
      text: payload.text,
      media_url: payload.media_url || null,
      media_duration: payload.media_duration,
      is_read: false,
      is_edited: false,
      reply_to_message_id: payload.reply_to_message_id,
      reply_to_message: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            message_type: replyingTo.message_type,
            sender_name: replyingTo.sender_name || (replyingTo.sender_type === 'admin' ? 'Admin' : 'Foydalanuvchi'),
            sender_type: replyingTo.sender_type,
          }
        : null,
      created_at: new Date().toISOString(),
      is_sending: true,
    }

    setMessages(prev => [...prev, optimisticMsg])
    setReplyingTo(null)
    setSending(true)
    scrollToBottom(true)

    try {
      const realMsg = await sendAdminMessage(userId, payload)
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...realMsg, is_sending: false } : m))
      )
      // Chat ro'yxati uchun oxirgi xabarni yangilash
      setChat(prev =>
        prev
          ? {
              ...prev,
              last_message_text: realMsg.text,
              last_message_type: realMsg.message_type,
              last_sender_type: 'admin',
              last_message_at: realMsg.created_at,
            }
          : null
      )
      scrollToBottom(true)
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, is_sending: false, has_error: true } : m))
      )
      throw err
    } finally {
      setSending(false)
    }
  }

  // Xabarni o'chirish
  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteAdminMessage(messageId)
      setMessages(prev => prev.filter(m => m.id !== messageId))
    } catch (err: any) {
      alert(err?.message || "Xabarni o'chirishda xatolik")
    }
  }

  // Xabarni tahrirlash
  const handleEditMessage = async (messageId: number, newText: string) => {
    try {
      const updated = await editAdminMessage(messageId, newText)
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, text: updated.text, is_edited: true } : m))
      )
    } catch (err: any) {
      alert(err?.message || "Xabarni tahrirlashda xatolik")
    }
  }

  return {
    chat,
    setChat,
    messages,
    loading,
    sending,
    error,
    isUserTyping,
    isUserOnline,
    replyingTo,
    setReplyingTo,
    socketStatus,
    messagesEndRef,
    sendMessage,
    deleteMessage: handleDeleteMessage,
    editMessage: handleEditMessage,
    reloadChat: () => loadChat(false),
    notifyTyping: (isTyping: boolean) => sendTyping(userId, isTyping),
    scrollToBottom,
  }
}
