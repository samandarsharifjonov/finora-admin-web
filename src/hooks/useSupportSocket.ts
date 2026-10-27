import { useEffect, useRef, useState, useCallback } from 'react'
import { getBaseApiUrl, getToken } from '../lib/api'
import type { SupportMessage } from '../types/support'

export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface TypingEvent {
  userId: number
  isTyping: boolean
  senderType: 'user' | 'admin'
}

export interface UserStatusEvent {
  userId: number
  isOnline: boolean
}

/**
 * Web Audio API yordamida yengil va yoqimli bildirishnoma tovushi (chime)
 */
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12) // A5

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.08)
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22) // D6

    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.03)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.08)
    osc1.stop(now + 0.35)
    osc2.stop(now + 0.35)
  } catch {
    // Brauzer avtoplay siyosati ruxsat bermasa, jimgina e'tiborsiz qoldiramiz
  }
}

interface UseSupportSocketProps {
  onNewMessage?: (msg: SupportMessage, userId: number) => void
  onChatUpdated?: (chatId: number, userId: number, lastMessage: any) => void
  onTyping?: (event: TypingEvent) => void
  onUserStatus?: (event: UserStatusEvent) => void
}

export function useSupportSocket({
  onNewMessage,
  onChatUpdated,
  onTyping,
  onUserStatus,
}: UseSupportSocketProps = {}) {
  const [status, setStatus] = useState<SocketStatus>('disconnected')
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const activeChatUserIdRef = useRef<number | null>(null)

  // Callback ref'lar orqali har safar qayta ulanishning oldini olamiz
  const callbacksRef = useRef({
    onNewMessage,
    onChatUpdated,
    onTyping,
    onUserStatus,
  })

  useEffect(() => {
    callbacksRef.current = {
      onNewMessage,
      onChatUpdated,
      onTyping,
      onUserStatus,
    }
  }, [onNewMessage, onChatUpdated, onTyping, onUserStatus])

  const connect = useCallback(() => {
    const token = getToken()
    if (!token) {
      setStatus('disconnected')
      return
    }

    const baseHttpUrl = getBaseApiUrl().replace(/\/+$/, '')
    const wsProto = baseHttpUrl.startsWith('https') ? 'wss' : 'ws'
    const cleanHost = baseHttpUrl.replace(/^https?:\/\//, '')
    const wsUrl = `${wsProto}://${cleanHost}/support/ws?token=${encodeURIComponent(token)}`

    try {
      if (socketRef.current) {
        socketRef.current.close()
      }

      setStatus('connecting')
      const ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        setStatus('connected')
        reconnectAttemptsRef.current = 0

        // Agar foydalanuvchi faol chatda bo'lsa, qayta tiklash
        if (activeChatUserIdRef.current) {
          sendWsEvent('enter_chat', {
            chat_type: 'support',
            target_user_id: activeChatUserIdRef.current,
          })
        }

        // 25 soniyali Heartbeat Ping
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'ping', type: 'ping' }))
          }
        }, 25000)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const eventType = data.event || data.type

          if (eventType === 'pong') return

          if (eventType === 'new_message') {
            const rawMsg = data.message || data.message_obj || data
            const userId = data.user_id || rawMsg.sender_id || 0

            const normalizedMsg: SupportMessage = {
              id: rawMsg.id || Date.now(),
              chat_id: rawMsg.chat_id || data.chat_id || 0,
              sender_id: rawMsg.sender_id || userId,
              sender_name: rawMsg.sender_name,
              sender_avatar: rawMsg.sender_avatar,
              sender_type: rawMsg.sender_type || (rawMsg.sender_id === userId ? 'user' : 'admin'),
              message_type: rawMsg.message_type || (rawMsg.media_url ? 'image' : 'text'),
              text: rawMsg.text || rawMsg.message || rawMsg.message_text || '',
              media_url: rawMsg.media_url || rawMsg.image_url || null,
              media_duration: rawMsg.media_duration,
              waveforms: rawMsg.waveforms,
              is_read: !!rawMsg.is_read,
              is_edited: !!rawMsg.is_edited,
              reply_to_message_id: rawMsg.reply_to_message_id,
              reply_to_message: rawMsg.reply_to_message,
              reactions: rawMsg.reactions || [],
              created_at: rawMsg.created_at || new Date().toISOString(),
            }

            // Foydalanuvchidan xabar kelgan bo'lsa, tovush chiqarish
            if (normalizedMsg.sender_type === 'user') {
              playNotificationSound()
            }

            callbacksRef.current.onNewMessage?.(normalizedMsg, userId)
          }

          if (eventType === 'admin_chat_updated') {
            const chatId = data.chat_id || 0
            const userId = data.user_id || 0
            const lastMsg = data.message || data.message_obj
            callbacksRef.current.onChatUpdated?.(chatId, userId, lastMsg)
          }

          if (eventType === 'typing') {
            const userId = data.user_id || data.chat_user_id || 0
            const isTyping = !!data.is_typing
            const senderType = data.sender_type || (data.is_admin ? 'admin' : 'user')
            callbacksRef.current.onTyping?.({ userId, isTyping, senderType })
          }

          if (eventType === 'user_status') {
            const userId = data.user_id || 0
            const isOnline = !!data.is_online
            callbacksRef.current.onUserStatus?.({ userId, isOnline })
          }
        } catch (err) {
          console.error('[WS Parse Error]:', err)
        }
      }

      ws.onerror = () => {
        setStatus('error')
      }

      ws.onclose = () => {
        setStatus('disconnected')
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)

        // Qayta ulanish eksponentsial vaqt bilan (2s, 4s, 8s, maks 15s)
        const delay = Math.min(2000 * Math.pow(1.5, reconnectAttemptsRef.current), 15000)
        reconnectAttemptsRef.current += 1
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, delay)
      }
    } catch {
      setStatus('error')
    }
  }, [])

  const sendWsEvent = useCallback((event: string, payload: Record<string, any> = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event,
          ...payload,
        })
      )
    }
  }, [])

  const enterChat = useCallback(
    (targetUserId: number) => {
      activeChatUserIdRef.current = targetUserId
      sendWsEvent('enter_chat', {
        chat_type: 'support',
        target_user_id: targetUserId,
        chat_user_id: targetUserId,
      })
    },
    [sendWsEvent]
  )

  const leaveChat = useCallback(() => {
    activeChatUserIdRef.current = null
    sendWsEvent('leave_chat', {
      chat_type: 'support',
    })
  }, [sendWsEvent])

  const sendTyping = useCallback(
    (targetUserId: number, isTyping: boolean) => {
      sendWsEvent('typing', {
        target_user_id: targetUserId,
        chat_user_id: targetUserId,
        is_typing: isTyping,
      })
    },
    [sendWsEvent]
  )

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [connect])

  return {
    status,
    enterChat,
    leaveChat,
    sendTyping,
    reconnect: connect,
  }
}
