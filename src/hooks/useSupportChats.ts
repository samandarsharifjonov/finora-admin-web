import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  fetchAdminChats,
  blockSupportUser,
  unblockSupportUser,
  hideChatForAdmin,
} from '../lib/supportApi'
import type { SupportChat, SupportStatsSummary } from '../types/support'
import { useSupportSocket } from './useSupportSocket'

export type FilterTab = 'all' | 'unread' | 'online' | 'blocked'

export function useSupportChats() {
  const [chats, setChats] = useState<SupportChat[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')

  const fetchChats = useCallback(async (isSilent = false) => {
    if (isSilent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const res = await fetchAdminChats({ search })
      setChats(res.chats)
      setTotal(res.total)
    } catch (err: any) {
      setError(err?.message || "Murojaatlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search])

  // Dastlabki yuklash va qidiruv o'zgarganda
  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  // WebSocket orqali ro'yxatni real-vaqtda yangilash
  const handleChatUpdated = useCallback((chatId: number, userId: number, lastMsg: any) => {
    setChats(prev => {
      const idx = prev.findIndex(c => c.user_id === userId || c.id === chatId)
      if (idx !== -1) {
        const updated = [...prev]
        const current = updated[idx]
        const text = lastMsg?.text || lastMsg?.message || current.last_message_text
        const type = lastMsg?.message_type || current.last_message_type
        const sender = lastMsg?.sender_type || current.last_sender_type

        updated[idx] = {
          ...current,
          last_message_text: text,
          last_message_type: type,
          last_sender_type: sender,
          last_message_at: lastMsg?.created_at || new Date().toISOString(),
          admin_unread_count: sender === 'user' ? (current.admin_unread_count || 0) + 1 : current.admin_unread_count,
        }
        // Yangi xabar kelgan chatni tepaga ko'tarish
        return [updated[idx], ...updated.filter((_, i) => i !== idx)]
      } else {
        // Agar yangi foydalanuvchi birinchi marta yozgan bo'lsa, ro'yxatni foniy yangilash
        fetchChats(true)
        return prev
      }
    })
  }, [fetchChats])

  const handleUserStatus = useCallback(({ userId, isOnline }: { userId: number; isOnline: boolean }) => {
    setChats(prev =>
      prev.map(c => (c.user_id === userId ? { ...c, is_user_online: isOnline } : c))
    )
  }, [])

  const { status: socketStatus } = useSupportSocket({
    onChatUpdated: handleChatUpdated,
    onUserStatus: handleUserStatus,
  })

  // 15 soniyalik foniy polling (WebSocket bo'lmaganda yoki tarmoq uzilganda zaxira)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchChats(true)
    }, 15000)
    return () => clearInterval(timer)
  }, [fetchChats])

  // Statistika hisobi
  const stats: SupportStatsSummary = useMemo(() => {
    return {
      totalChats: chats.length || total,
      unreadChats: chats.filter(c => (c.admin_unread_count || 0) > 0).length,
      onlineUsers: chats.filter(c => c.is_user_online).length,
      blockedUsers: chats.filter(c => c.is_blocked).length,
    }
  }, [chats, total])

  // Filtrlangan chatlar
  const filteredChats = useMemo(() => {
    return chats.filter(c => {
      if (tab === 'unread') return (c.admin_unread_count || 0) > 0
      if (tab === 'online') return !!c.is_user_online
      if (tab === 'blocked') return !!c.is_blocked
      return true
    })
  }, [chats, tab])

  // Foydalanuvchini bloklash
  const handleBlock = async (userId: number, reason?: string) => {
    await blockSupportUser(userId, reason)
    setChats(prev =>
      prev.map(c =>
        c.user_id === userId ? { ...c, is_blocked: true, blocked_reason: reason } : c
      )
    )
  }

  // Foydalanuvchini blokdan chiqarish
  const handleUnblock = async (userId: number) => {
    await unblockSupportUser(userId)
    setChats(prev =>
      prev.map(c =>
        c.user_id === userId ? { ...c, is_blocked: false, blocked_reason: null } : c
      )
    )
  }

  // Chatni admin ro'yxatidan yashirish
  const handleHide = async (userId: number) => {
    await hideChatForAdmin(userId)
    setChats(prev => prev.filter(c => c.user_id !== userId))
    setTotal(prev => Math.max(0, prev - 1))
  }

  return {
    chats: filteredChats,
    rawChatsCount: chats.length,
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
    refresh: () => fetchChats(false),
    handleBlock,
    handleUnblock,
    handleHide,
  }
}
