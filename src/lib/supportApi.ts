import { apiRequest } from './api'
import type {
  AdminSupportChatListResponse,
  SupportChatDetailResponse,
  SupportMessage,
  SendMessagePayload,
  SupportChat,
} from '../types/support'

/**
 * Admin uchun barcha chatlar va suhbatlar ro'yxatini yuklash
 */
export async function fetchAdminChats(params?: {
  search?: string
  page?: number
  limit?: number
}): Promise<{ chats: SupportChat[]; total: number; totalUnread: number }> {
  try {
    const res = await apiRequest<AdminSupportChatListResponse>('/admin/support/chats', {
      params: {
        search: params?.search,
        page: params?.page,
        limit: params?.limit || 100,
      },
    })

    const rawList = res.chats || res.conversations || []
    const normalizedChats: SupportChat[] = rawList.map(c => ({
      ...c,
      id: c.id || c.conversation_id || 0,
      user_name: c.user_name || c.user_full_name || "Noma'lum",
      user_avatar_url: c.user_avatar_url || c.user_avatar || null,
      last_message_text: c.last_message_text || c.last_message || '',
      admin_unread_count: c.admin_unread_count ?? c.unread_count ?? 0,
    }))

    return {
      chats: normalizedChats,
      total: res.total || normalizedChats.length,
      totalUnread: res.total_unread ?? res.unread_total ?? 0,
    }
  } catch (err) {
    // Agar /admin/support/chats da xatolik bo'lsa, /admin/support/conversations ga urinib ko'rish
    try {
      const fallbackRes = await apiRequest<any>('/admin/support/conversations', {
        params: { search: params?.search },
      })
      const rawList = fallbackRes.conversations || fallbackRes.chats || (Array.isArray(fallbackRes) ? fallbackRes : [])
      const normalizedChats: SupportChat[] = rawList.map((c: any) => ({
        ...c,
        id: c.id || c.conversation_id || 0,
        user_name: c.user_name || c.user_full_name || "Noma'lum",
        user_avatar_url: c.user_avatar_url || c.user_avatar || null,
        last_message_text: c.last_message_text || c.last_message || '',
        admin_unread_count: c.admin_unread_count ?? c.unread_count ?? 0,
      }))
      return {
        chats: normalizedChats,
        total: normalizedChats.length,
        totalUnread: normalizedChats.reduce((acc, cur) => acc + (cur.admin_unread_count || 0), 0),
      }
    } catch {
      throw err
    }
  }
}

/**
 * Muayyan foydalanuvchining chat xabarlari va tafsilotlarini yuklash
 */
export async function fetchAdminChatDetail(userId: number): Promise<SupportChatDetailResponse> {
  try {
    const res = await apiRequest<SupportChatDetailResponse>(`/admin/support/chats/${userId}`)
    const chat = res.chat || res.conversation
    return {
      ...res,
      chat: chat
        ? {
            ...chat,
            id: chat.id || chat.conversation_id || 0,
            user_name: chat.user_name || chat.user_full_name || "Noma'lum",
            user_avatar_url: chat.user_avatar_url || chat.user_avatar || null,
            last_message_text: chat.last_message_text || chat.last_message || '',
          }
        : undefined,
      messages: (res.messages || []).map(m => ({
        ...m,
        text: m.text || m.message || '',
        media_url: m.media_url || m.image_url || null,
      })),
    }
  } catch (err) {
    // Fallback: /admin/support/conversations/{userId}/messages
    const fallbackRes = await apiRequest<any>(`/admin/support/conversations/${userId}/messages`)
    const rawMessages = fallbackRes.messages || (Array.isArray(fallbackRes) ? fallbackRes : [])
    return {
      chat: fallbackRes.conversation || fallbackRes.chat,
      messages: rawMessages.map((m: any) => ({
        ...m,
        text: m.text || m.message || '',
        media_url: m.media_url || m.image_url || null,
      })),
      unread_count: fallbackRes.unread_count || 0,
      total: rawMessages.length,
      has_more: false,
    }
  }
}

/**
 * Admin nomidan foydalanuvchiga xabar yuborish
 */
export async function sendAdminMessage(
  userId: number,
  payload: SendMessagePayload
): Promise<SupportMessage> {
  const res = await apiRequest<SupportMessage>(`/admin/support/chats/${userId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message_type: payload.message_type || (payload.media_url ? 'image' : 'text'),
      text: payload.text,
      message: payload.text,
      media_url: payload.media_url || '',
      image_url: payload.media_url || '',
      reply_to_message_id: payload.reply_to_message_id,
      media_duration: payload.media_duration || 0,
    }),
  })

  return {
    ...res,
    text: res.text || res.message || payload.text,
    media_url: res.media_url || res.image_url || payload.media_url || null,
  }
}

/**
 * Xabarlarni admin tomonidan o'qildi deb belgilash
 */
export async function markChatAsRead(userId: number): Promise<void> {
  try {
    await apiRequest(`/admin/support/conversations/${userId}/read`, {
      method: 'POST',
    })
  } catch {
    // Agar endpoint mavjud bo'lmasa yoki xato bersa ham, chat oqimini to'xtatmaymiz
  }
}

/**
 * Foydalanuvchini support chatidan bloklash
 */
export async function blockSupportUser(userId: number, reason?: string): Promise<void> {
  await apiRequest(`/admin/support/chats/${userId}/block`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || 'Admin qarori bilan bloklandi' }),
  })
}

/**
 * Foydalanuvchini blokdan chiqarish
 */
export async function unblockSupportUser(userId: number): Promise<void> {
  await apiRequest(`/admin/support/chats/${userId}/unblock`, {
    method: 'POST',
  })
}

/**
 * Chatni admin ro'yxatidan yashirish (foydalanuvchi tomonida saqlanadi)
 */
export async function hideChatForAdmin(userId: number): Promise<void> {
  await apiRequest(`/admin/support/chats/${userId}`, {
    method: 'DELETE',
  })
}

/**
 * Admin tomonidan xabarni o'chirish
 */
export async function deleteAdminMessage(messageId: number): Promise<void> {
  await apiRequest(`/admin/support/chats/messages/${messageId}`, {
    method: 'DELETE',
  })
}

/**
 * Admin tomonidan xabarni tahrirlash
 */
export async function editAdminMessage(messageId: number, text: string): Promise<SupportMessage> {
  return await apiRequest<SupportMessage>(`/admin/support/chats/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ text, message: text }),
  })
}

/**
 * Rasm yoki media faylni Cloudflare R2 / Serverga yuklash
 */
export async function uploadSupportMedia(file: File): Promise<{ url: string; fileName?: string }> {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('file', file)

  const res = await apiRequest<any>('/admin/support/upload', {
    method: 'POST',
    body: formData,
  }).catch(async () => {
    // Fallback: /support/chat/upload
    return await apiRequest<any>('/support/chat/upload', {
      method: 'POST',
      body: formData,
    })
  })

  return {
    url: res.url || res.image_url || '',
    fileName: res.file_name,
  }
}

/**
 * Jami o'qilmagan xabarlar sonini olish
 */
export async function fetchAdminUnreadCount(): Promise<number> {
  try {
    const res = await apiRequest<{ unread_count: number }>('/admin/support/unread-count')
    return res.unread_count || 0
  } catch {
    return 0
  }
}

export interface BroadcastSupportPayload {
  target_audience: 'all' | 'active_30d' | 'active_7d' | 'with_chats'
  message_type: 'text' | 'image'
  text: string
  media_url?: string
}

export interface BroadcastSupportResponse {
  target_audience: string
  total_targeted: number
  total_sent: number
  failed_count: number
  message: string
}

/**
 * Barcha yoki tanlangan foydalanuvchilarning shaxsiy support chatiga umumiy xabar yuborish
 */
export async function broadcastSupportMessage(
  payload: BroadcastSupportPayload
): Promise<BroadcastSupportResponse> {
  const res = await apiRequest<any>('/admin/support/broadcast', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res?.data || res
}
