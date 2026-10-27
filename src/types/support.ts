export interface SupportReplyPreview {
  id: number
  text: string
  message?: string
  message_type: string
  sender_name: string
  sender_type: string
}

export interface SupportMessageReaction {
  reaction: string
  count: number
  user_ids: number[]
  has_reacted: boolean
}

export interface SupportMessage {
  id: number
  chat_id: number
  conversation_id?: number
  sender_id: number
  sender_name?: string
  sender_avatar?: string | null
  sender_type: 'user' | 'admin'
  message_type: 'text' | 'image' | 'voice'
  text: string
  message?: string
  media_url?: string | null
  image_url?: string | null
  media_duration?: number
  waveforms?: number[]
  is_read: boolean
  is_edited: boolean
  reply_to_message_id?: number | null
  reply_to_message?: SupportReplyPreview | null
  reactions?: SupportMessageReaction[]
  created_at: string
  updated_at?: string
  // Optimistic UI flags
  is_sending?: boolean
  has_error?: boolean
}

export interface SupportChat {
  id: number
  conversation_id?: number
  user_id: number
  user_name?: string
  user_full_name?: string
  user_email?: string
  user_avatar_url?: string | null
  user_avatar?: string | null
  user_last_seen_at?: string | null
  is_blocked: boolean
  blocked_reason?: string | null
  is_hidden_by_admin?: boolean
  is_user_online?: boolean
  last_message_at: string
  last_message_text: string
  last_message?: string
  last_message_type: 'text' | 'image' | 'voice' | string
  last_sender_type: 'user' | 'admin' | string
  user_unread_count: number
  admin_unread_count: number
  unread_count?: number
  created_at?: string
  updated_at?: string
}

export interface AdminSupportChatListResponse {
  chats?: SupportChat[]
  conversations?: SupportChat[]
  total: number
  total_unread?: number
  unread_total?: number
}

export interface SupportChatDetailResponse {
  chat?: SupportChat
  conversation?: SupportChat
  messages: SupportMessage[]
  unread_count?: number
  total?: number
  has_more?: boolean
  is_user_online?: boolean
  is_support_online?: boolean
  support_avatar_url?: string
  support_name?: string
}

export interface SendMessagePayload {
  message_type?: 'text' | 'image' | 'voice'
  text: string
  media_url?: string
  reply_to_message_id?: number
  media_duration?: number
}

export interface SupportStatsSummary {
  totalChats: number
  unreadChats: number
  onlineUsers: number
  blockedUsers: number
}
