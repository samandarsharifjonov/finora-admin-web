import React, { useEffect, useState, useRef } from 'react'
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
  Eye,
  Plus,
  X,
  ExternalLink,
  Smartphone,
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
  const [images, setImages] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingImage(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('image', file)

        const res = await apiRequest<{ image_url: string }>('/admin/notifications/upload-image', {
          method: 'POST',
          body: formData,
        })
        if (res && res.image_url) {
          uploadedUrls.push(res.image_url)
        }
      }
      setImages(prev => [...prev, ...uploadedUrls])
    } catch (err: any) {
      setError(err?.message || "Rasm yuklashda xatolik yuz berdi")
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAddUrlImage = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (!images.includes(trimmed)) {
      setImages(prev => [...prev, trimmed])
    }
    setUrlInput('')
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

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
          images: images.length > 0 ? images : undefined,
          image_url: images.length > 0 ? images[0] : undefined,
          action_url: actionUrl.trim() || undefined,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          send_now: !scheduledAt,
        }),
      })

      setSuccessMsg(scheduledAt ? "Yangilik belgilangan vaqtga rejalashtirildi!" : "Yangilik barcha foydalanuvchilarga muvaffaqiyatli yuborildi!")
      setTitle('')
      setBody('')
      setImages([])
      setUrlInput('')
      setActionUrl('')
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
    if (!confirm("Ushbu rejalashtirilgan yangilikni bekor qilmoqchimisiz?")) return
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
            Xabarnomalar va Yangiliklar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Mobil ilovaga rasmiy yangiliklar chop etish, rejalashtirish va push-bildirishnomalar yuborish
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
                Yangi yangilik / xabar yuborish
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
              {/* Sarlavha */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Sarlavha (Mavzu) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Masalan: Finora ilovasida yangi imkoniyatlar!"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-2 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                />
              </div>

              {/* Xabar matni */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Yangilik / Xabar matni *
                </label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Yangilikning to'liq matnini kiriting..."
                  rows={4}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-2 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white resize-none"
                />
              </div>

              {/* Rasmlar (Ko'p rasm qo'llab-quvvatlash) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rasmlar ({images.length} ta)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex items-center gap-1 text-[11px] font-bold text-finora-600 hover:text-finora-700 dark:text-finora-400"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{isUploadingImage ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                  </button>
                </div>

                {/* Yuklangan rasmlar miniatyuralari */}
                {images.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-dark-border dark:bg-dark-cardSecondary">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group h-14 w-14 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                        <img src={img} alt={`img-${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL orqali rasm qo'shish */}
                <div className="mt-2 flex gap-1.5">
                  <div className="relative flex-1">
                    <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="yoki rasm havolasini kiriting (https://...)"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    disabled={!urlInput.trim()}
                    className="rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  >
                    Qo'shish
                  </button>
                </div>
              </div>

              {/* Tashqi havola (Action URL) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tashqi havola / Sayt manzili (ixtiyoriy)
                </label>
                <div className="relative mt-1">
                  <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={actionUrl}
                    onChange={e => setActionUrl(e.target.value)}
                    placeholder="https://finora.uz/... (ixtiyoriy)"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-2 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  />
                </div>
              </div>

              {/* Yuborish vaqti */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Yuborish vaqti (Rejalashtirish)
                </label>
                <div className="relative mt-1">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition-all focus:border-finora-500 focus:bg-white focus:ring-2 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[10.5px] text-slate-400">
                  Bo'sh qoldirilsa, zudlik bilan barcha foydalanuvchilarga yuboriladi
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-finora-500 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-finora-600 active:scale-[0.99] disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
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
                  Yuborilgan va rejalashtirilgan yangiliklar ({broadcasts.length})
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {b.title}
                          </h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              b.status === 'sent'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : b.status === 'scheduled' || b.status === 'pending'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {b.status === 'sent'
                              ? 'Yuborildi'
                              : b.status === 'scheduled' || b.status === 'pending'
                              ? 'Rejalashtirilgan'
                              : 'Bekor qilingan'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {b.body}
                        </p>

                        {/* Rasmlar oldindan ko'rish */}
                        {((b.images && b.images.length > 0) || b.image_url) && (
                          <div className="mt-2 flex items-center gap-1.5">
                            {(b.images && b.images.length > 0 ? b.images : [b.image_url!]).slice(0, 3).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt="preview"
                                className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                              />
                            ))}
                            {(b.images?.length || 0) > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{(b.images?.length || 0) - 3} ta
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(b.sent_at || b.scheduled_at || b.created_at)}
                          </span>

                          {/* Ko'rilganlar soni */}
                          <span className="flex items-center gap-1 text-finora-600 dark:text-finora-400 font-medium">
                            <Eye className="h-3 w-3" />
                            {b.views_count ?? 0} ko'rishlar
                          </span>

                          {/* Yetkazilgan qurilmalar soni */}
                          <span className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            {b.sent_count ?? 0} qurilmaga yetkazildi
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {(b.status === 'scheduled' || b.status === 'pending') && (
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
