import React, { useEffect, useState } from 'react'
import {
  BellRing,
  Send,
  Calendar,
  Image as ImageIcon,
  Clock,
  Trash2,
  XCircle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type { BroadcastNotification } from '../types'
import { formatDate } from '../lib/utils'

export const BroadcastPage: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchBroadcasts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<any>('/admin/notifications/broadcast')
      const items = Array.isArray(res) ? res : res?.items || []
      setBroadcasts(items)
    } catch (err: any) {
      setError(err?.message || "Xabarnomalarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBroadcasts()
  }, [])

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await apiRequest('/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          image_url: imageUrl.trim() || undefined,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        }),
      })

      setSuccessMsg("Xabarnoma muvaffaqiyatli yuborildi!")
      setTitle('')
      setBody('')
      setImageUrl('')
      setScheduledAt('')
      fetchBroadcasts()
    } catch (err: any) {
      setError(err?.message || "Xabarnoma yuborishda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearHistory = async () => {
    if (!confirm("Barcha xabarnomalar tarixini tozalashni tasdiqlaysizmi?")) return
    try {
      await apiRequest('/admin/notifications/broadcast', { method: 'DELETE' })
      setBroadcasts([])
    } catch (err: any) {
      alert(err?.message || "Tarixni tozalashda xatolik")
    }
  }

  const handleCancelBroadcast = async (id: number) => {
    if (!confirm("Ushbu rejalashtirilgan xabarnomani bekor qilmoqchimisiz?")) return
    try {
      await apiRequest(`/admin/notifications/broadcast/${id}/cancel`, { method: 'POST' })
      fetchBroadcasts()
    } catch (err: any) {
      alert(err?.message || "Bekor qilishda xatolik")
    }
  }

  const handleDeleteBroadcast = async (id: number) => {
    if (!confirm("Ushbu xabarnomani o'chirmoqchimisiz?")) return
    try {
      await apiRequest(`/admin/notifications/broadcast/${id}`, { method: 'DELETE' })
      fetchBroadcasts()
    } catch (err: any) {
      alert(err?.message || "O'chirishda xatolik")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Ommaviy Xabarnomalar (Broadcast)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Barcha foydalanuvchilarga push-bildirishnomalar yuborish va rejalashtirish
          </p>
        </div>

        <button
          onClick={fetchBroadcasts}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Create Broadcast Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-dark-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-finora-100 text-finora-600 dark:bg-finora-950 dark:text-finora-400">
                <Send className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Yangi Xabarnoma Yaratish
              </h2>
            </div>

            {successMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Sarlavha (Title) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Masalan: Yangi imkoniyatlar qo'shildi! 🎉"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Xabar matni (Body) *
                </label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Foydalanuvchilarga yetkazilishi kerak bo'lgan xabar..."
                  rows={4}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rasm havolasi (ixtiyoriy)
                </label>
                <div className="relative mt-1.5">
                  <ImageIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://.../banner.png"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rejalashtirilgan vaqt (ixtiyoriy)
                </label>
                <div className="relative mt-1.5">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none transition-all focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[10.5px] text-slate-400">
                  Agar bo'sh qoldirilsa, xabar darhol barchaga yuboriladi
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-finora-500 py-3 text-xs font-bold text-slate-950 shadow-md shadow-finora-500/25 transition-all hover:bg-finora-600 active:scale-[0.99] disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Yuborilmoqda...' : scheduledAt ? 'Rejalashtirish' : 'Barchaga yuborish'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Broadcasts History (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-slate-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Yuborilgan Xabarnomalar Tarixi ({broadcasts.length})
                </h2>
              </div>
              {broadcasts.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
                >
                  <Trash2 className="h-3 w-3" /> Tarixni tozalash
                </button>
              )}
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-dark-border/60">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-finora-500 border-t-transparent" />
                </div>
              ) : broadcasts.length === 0 ? (
                <p className="py-10 text-center text-xs text-slate-400">
                  Hozircha xabarnomalar yuborilmagan
                </p>
              ) : (
                broadcasts.map(b => (
                  <div key={b.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {b.title}
                          </h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              b.status === 'sent'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : b.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {b.status === 'sent' ? 'Yuborildi' : b.status === 'scheduled' ? 'Rejalashtirilgan' : 'Bekor qilingan'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          {b.body}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(b.sent_at || b.scheduled_at || b.created_at)}
                          </span>
                          <span>Qabul qiluvchilar: {b.sent_count ?? b.recipient_count ?? 'Barchasi'} ta</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {b.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelBroadcast(b.id)}
                            title="Bekor qilish"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBroadcast(b.id)}
                          title="Tarixdan o'chirish"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
