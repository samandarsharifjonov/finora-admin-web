import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  BellRing,
  Send,
  Calendar,
  Image as ImageIcon,
  Clock,
  Trash2,
  XCircle,
  RefreshCw,
  Eye,
  Plus,
  X,
  ExternalLink,
  Smartphone,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type { BroadcastNotification } from '../types'
import { formatDate } from '../lib/utils'
import { ConfirmModal } from '../components/common/ConfirmModal'
import { Skeleton } from '../components/common/Skeleton'
import { useToast } from '../context/ToastContext'

type HistoryFilter = 'all' | 'sent' | 'pending' | 'cancelled'

const HISTORY_TABS: { id: HistoryFilter; label: string }[] = [
  { id: 'all', label: 'Barchasi' },
  { id: 'sent', label: 'Yuborilgan' },
  { id: 'pending', label: 'Rejalashtirilgan' },
  { id: 'cancelled', label: 'Bekor qilingan' },
]

export const BroadcastPage: React.FC = () => {
  const toast = useToast()
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all')

  // Form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Confirm modal state
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fetchBroadcasts = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<any>('/admin/notifications/broadcast')
      const items = Array.isArray(res) ? res : res?.items || []
      setBroadcasts(items)
    } catch (err: any) {
      toast.error('Xatolik', err?.message || 'Xabarnomalarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBroadcasts()
  }, [])

  const filteredBroadcasts = useMemo(() => {
    if (historyFilter === 'all') return broadcasts
    if (historyFilter === 'pending') {
      return broadcasts.filter(b => b.status === 'pending' || b.status === 'scheduled')
    }
    return broadcasts.filter(b => b.status === historyFilter)
  }, [broadcasts, historyFilter])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingImage(true)
    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('image', files[i])

        const res = await apiRequest<{ image_url: string }>('/admin/notifications/upload-image', {
          method: 'POST',
          body: formData,
        })
        if (res?.image_url) {
          uploadedUrls.push(res.image_url)
        }
      }
      setImages(prev => [...prev, ...uploadedUrls])
      if (uploadedUrls.length > 0) {
        toast.success('Yuklandi', `${uploadedUrls.length} ta rasm qo‘shildi`)
      }
    } catch (err: any) {
      toast.error('Xatolik', err?.message || 'Rasm yuklashda xatolik')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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

      toast.success(
        scheduledAt ? 'Rejalashtirildi' : 'Yuborildi',
        scheduledAt ? 'Xabarnoma belgilangan vaqtga saqlandi.' : 'Barcha foydalanuvchilarga yuborildi.'
      )
      setTitle('')
      setBody('')
      setImages([])
      setUrlInput('')
      setActionUrl('')
      setScheduledAt('')
      fetchBroadcasts()
    } catch (err: any) {
      toast.error('Xatolik', err?.message || 'Xabarnoma yuborishda xatolik')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmClearHistory = async () => {
    setModalLoading(true)
    try {
      await apiRequest('/admin/notifications/broadcast', { method: 'DELETE' })
      setBroadcasts([])
      setConfirmClearAll(false)
      toast.success('Tozalandi', 'Barcha xabarnomalar bazadan va qurilmalardan o‘chirildi.')
    } catch (err: any) {
      toast.error('Xatolik', err?.message || 'Tozalashda xatolik')
    } finally {
      setModalLoading(false)
    }
  }

  const confirmCancelBroadcast = async () => {
    if (cancelTargetId === null) return
    setModalLoading(true)
    try {
      await apiRequest(`/admin/notifications/broadcast/${cancelTargetId}/cancel`, { method: 'POST' })
      setCancelTargetId(null)
      toast.success('Bekor qilindi', 'Rejalashtirilgan xabarnoma bekor qilindi.')
      fetchBroadcasts()
    } catch (err: any) {
      toast.error('Xatolik', err?.message || 'Bekor qilishda xatolik')
    } finally {
      setModalLoading(false)
    }
  }

  const confirmDeleteBroadcast = async () => {
    if (deleteTargetId === null) return
    setModalLoading(true)
    try {
      await apiRequest(`/admin/notifications/broadcast/${deleteTargetId}?delete_in_app=true`, {
        method: 'DELETE',
      })
      setDeleteTargetId(null)
      toast.success("O'chirildi", 'Yangilik bazadan va barcha qurilmalardan o‘chirildi.')
      fetchBroadcasts()
    } catch (err: any) {
      toast.error('Xatolik', err?.message || "O'chirishda xatolik")
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Xabarnomalar va yangiliklar
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Push-xabarnoma va yangiliklarni yuborish
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBroadcasts}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-finora-600' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Create Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 dark:border-dark-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-finora-500/15 text-finora-700 dark:text-finora-400">
                <Send className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Yangi xabar yaratish
              </h2>
            </div>

            <form onSubmit={handleSendBroadcast} className="mt-4 space-y-3.5">
              {/* Sarlavha */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Sarlavha *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Sarlavha..."
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                />
              </div>

              {/* Matn */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Matn *
                </label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Xabar matni..."
                  rows={4}
                  required
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                />
              </div>

              {/* Rasmlar */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rasmlar {images.length > 0 ? `(${images.length})` : ''}
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
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-finora-600 hover:text-finora-700 dark:text-finora-400"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{isUploadingImage ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 dark:border-dark-border dark:bg-dark-cardSecondary/60">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200 dark:border-dark-border"
                      >
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

                <div className="mt-2 flex gap-1.5">
                  <div className="relative flex-1">
                    <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="Rasm havolasi (https://...)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    disabled={!urlInput.trim()}
                    className="rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  >
                    Qo‘shish
                  </button>
                </div>
              </div>

              {/* Havola */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Havola (ixtiyoriy)
                </label>
                <div className="relative mt-1">
                  <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={actionUrl}
                    onChange={e => setActionUrl(e.target.value)}
                    placeholder="https://finora.uz/..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  />
                </div>
              </div>

              {/* Vaqt */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rejalashtirish (ixtiyoriy)
                </label>
                <div className="relative mt-1">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition-all focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[10.5px] text-slate-400">
                  Bo‘sh qoldirilsa darhol yuboriladi
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-finora-500 py-2.5 text-xs font-bold text-slate-950 shadow-sm shadow-finora-500/20 transition-all hover:bg-finora-400 active:scale-[0.99] disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                <span>
                  {isSubmitting
                    ? 'Yuborilmoqda...'
                    : scheduledAt
                    ? 'Rejalashtirish'
                    : 'Barchaga yuborish'}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* History List (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3.5 dark:border-dark-border sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-finora-600 dark:text-finora-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Xabarlar tarixi
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-slate-600 dark:bg-dark-cardSecondary dark:text-slate-300">
                  {filteredBroadcasts.length}
                </span>
              </div>

              {broadcasts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="inline-flex items-center gap-1 self-start rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 sm:self-auto"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Tozalash</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
              {HISTORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHistoryFilter(tab.id)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    historyFilter === tab.id
                      ? 'bg-finora-500 text-slate-950 shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-cardSecondary dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-2.5">
              {loading ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              ) : filteredBroadcasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-dark-cardSecondary">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Xabarlar topilmadi
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Yuborilgan yoki rejalashtirilgan xabarlar shu yerda ko‘rinadi
                  </p>
                </div>
              ) : (
                filteredBroadcasts.map(b => {
                  const imgs = b.images && b.images.length > 0 ? b.images : b.image_url ? [b.image_url] : []
                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 transition-colors hover:border-slate-300/80 hover:bg-slate-50 dark:border-dark-border/80 dark:bg-dark-cardSecondary/30 dark:hover:bg-dark-cardSecondary/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {b.title}
                            </h4>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[9.5px] font-bold ${
                                b.status === 'sent'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : b.status === 'scheduled' || b.status === 'pending'
                                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                                  : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {b.status === 'sent'
                                ? 'Yuborildi'
                                : b.status === 'scheduled' || b.status === 'pending'
                                ? 'Rejalashtirilgan'
                                : 'Bekor qilingan'}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            {b.body}
                          </p>

                          {imgs.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5">
                              {imgs.slice(0, 3).map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="preview"
                                  className="h-10 w-10 rounded-lg border border-slate-200 object-cover dark:border-dark-border"
                                />
                              ))}
                              {imgs.length > 3 && (
                                <span className="text-[10px] font-semibold text-slate-400">
                                  +{imgs.length - 3} ta
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] tabular-nums text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(b.sent_at || b.scheduled_at || b.created_at)}
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-finora-600 dark:text-finora-400">
                              <Eye className="h-3 w-3" />
                              {b.views_count ?? 0} ko‘rish
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              {b.sent_count ?? 0} qurilma
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {(b.status === 'scheduled' || b.status === 'pending') && (
                            <button
                              type="button"
                              onClick={() => setCancelTargetId(b.id)}
                              title="Bekor qilish"
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(b.id)}
                            title="O'chirish"
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modals */}
      <ConfirmModal
        open={confirmClearAll}
        title="Barchasini o‘chirish"
        description="Barcha xabarnoma va yangiliklar bazadan hamda barcha qurilmalardan butunlay o‘chiriladi."
        confirmLabel="Barchasini o‘chirish"
        variant="danger"
        loading={modalLoading}
        onConfirm={confirmClearHistory}
        onCancel={() => setConfirmClearAll(false)}
      />

      <ConfirmModal
        open={cancelTargetId !== null}
        title="Xabarnomani bekor qilish"
        description="Ushbu rejalashtirilgan xabarnomani bekor qilmoqchimisiz?"
        confirmLabel="Bekor qilish"
        variant="warning"
        loading={modalLoading}
        onConfirm={confirmCancelBroadcast}
        onCancel={() => setCancelTargetId(null)}
      />

      <ConfirmModal
        open={deleteTargetId !== null}
        title="Yangilikni bazadan o‘chirish"
        description="Ushbu yangilik bazadan va barcha foydalanuvchilar qurilmasidan butunlay o‘chiriladi."
        confirmLabel="O‘chirish"
        variant="danger"
        loading={modalLoading}
        onConfirm={confirmDeleteBroadcast}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}
