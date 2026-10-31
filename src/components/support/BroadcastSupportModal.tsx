import React, { useState, useRef } from 'react'
import {
  X,
  Megaphone,
  Users,
  Zap,
  Clock,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  UploadCloud,
  Eye,
} from 'lucide-react'
import {
  broadcastSupportMessage,
  uploadSupportMedia,
  type BroadcastSupportPayload,
  type BroadcastSupportResponse,
} from '../../lib/supportApi'

interface BroadcastSupportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type AudienceType = 'all' | 'active_30d' | 'active_7d' | 'with_chats'

export const BroadcastSupportModal: React.FC<BroadcastSupportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [audience, setAudience] = useState<AudienceType>('all')
  const [text, setText] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BroadcastSupportResponse | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!isOpen) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    try {
      const res = await uploadSupportMedia(file)
      if (res.url) {
        setMediaUrl(res.url)
      }
    } catch (err: any) {
      setError(err?.message || "Rasm yuklashda xatolik yuz berdi")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const applyTemplate = (templateText: string) => {
    setText(templateText)
  }

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed && !mediaUrl) {
      setError("Iltimos, xabar matnini kiriting yoki rasm tanlang")
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const payload: BroadcastSupportPayload = {
        target_audience: audience,
        message_type: mediaUrl ? 'image' : 'text',
        text: trimmed,
        media_url: mediaUrl || undefined,
      }

      const res = await broadcastSupportMessage(payload)
      setResult(res)
      setShowConfirm(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err?.message || "Xabarni tarqatishda xatolik yuz berdi")
      setShowConfirm(false)
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    if (isSending) return
    setError(null)
    setResult(null)
    setShowConfirm(false)
    onClose()
  }

  const audienceOptions: {
    id: AudienceType
    title: string
    desc: string
    icon: React.ComponentType<{ className?: string }>
    badgeColor: string
  }[] = [
    {
      id: 'all',
      title: 'Barcha foydalanuvchilar',
      desc: 'Ro\'yxatdan o\'tgan barcha bloklanmagan foydalanuvchilar (100%)',
      icon: Users,
      badgeColor: 'text-finora-600 bg-finora-50 dark:bg-finora-950/40 dark:text-finora-400',
    },
    {
      id: 'active_30d',
      title: 'Faol foydalanuvchilar (30 kun)',
      desc: 'Oxirgi 30 kunda tizimga kirgan barcha faol foydalanuvchilar',
      icon: Zap,
      badgeColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      id: 'active_7d',
      title: 'Yaqinda kirganlar (7 kun)',
      desc: 'Oxirgi 1 haftada tizimda faol bo\'lgan foydalanuvchilar',
      icon: Clock,
      badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'with_chats',
      title: 'Mavjud suhbatlar',
      desc: 'Avval support chatga yozgan foydalanuvchilar',
      icon: MessageSquare,
      badgeColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-dark-border bg-slate-50/70 dark:bg-dark-cardSecondary/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-finora-500/15 text-finora-600 dark:text-finora-400 border border-finora-500/20">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Umumiy xabar yuborish
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Support Chat
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Foydalanuvchilarning shaxsiy chatiga tushadi va ular bevosita javob qaytara oladi
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 dark:hover:bg-dark-border hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-5 space-y-5">
          {/* Result Alert if finished */}
          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Xabar muvaffaqiyatli tarqatildi!
                  </h4>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    {result.message}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                    <span className="text-emerald-800 dark:text-emerald-300">
                      Jami qamrov: <b>{result.total_targeted}</b>
                    </span>
                    <span className="text-emerald-800 dark:text-emerald-300">
                      Yetkazildi: <b>{result.total_sent}</b>
                    </span>
                    {result.failed_count > 0 && (
                      <span className="text-rose-600 dark:text-rose-400">
                        Xatolik: <b>{result.failed_count}</b>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!result && (
            <>
              {/* 1. Audience Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. Qabul qiluvchilar auditoriyasini tanlang:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {audienceOptions.map(opt => {
                    const Icon = opt.icon
                    const isSelected = audience === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAudience(opt.id)}
                        className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all ${
                          isSelected
                            ? 'border-finora-500 bg-finora-50/40 ring-1 ring-finora-500/30 dark:bg-finora-950/20 dark:border-finora-500'
                            : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-dark-border dark:bg-dark-cardSecondary/40'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${opt.badgeColor}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {opt.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Message Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    2. Xabar matni:
                  </label>
                  {/* Quick templates */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">Shablon:</span>
                    <button
                      type="button"
                      onClick={() =>
                        applyTemplate(
                          "Assalomu alaykum! Finora ilovasida yangi imkoniyatlar qo'shildi. Ilovani yangilab, qulayliklardan bahramand bo'ling! Savollaringiz bo'lsa, shu yerda yozishingiz mumkin."
                        )
                      }
                      className="text-[11px] font-semibold text-finora-600 dark:text-finora-400 hover:underline"
                    >
                      Yangilik
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        applyTemplate(
                          "Hurmatli foydalanuvchi! Tizimda profilaktika ishlari rejalashtirilgan. Tez orada xizmatlar yanada tezkor ishlaydi. Noqulayliklar uchun uzr so'raymiz!"
                        )
                      }
                      className="text-[11px] font-semibold text-finora-600 dark:text-finora-400 hover:underline"
                    >
                      Profilaktika
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Barcha foydalanuvchilarga yuboriladigan xabaringizni bu yerga yozing..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-finora-500 focus:outline-hidden focus:ring-2 focus:ring-finora-500/20 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Foydalanuvchi ilovada aynan shu matnni o'qiydi</span>
                  <span>{text.length} ta belgi</span>
                </div>
              </div>

              {/* 3. Image attachment (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  3. Rasm biriktirish (Ixtiyoriy):
                </label>
                {mediaUrl ? (
                  <div className="relative inline-block rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-dark-border dark:bg-dark-cardSecondary">
                    <img
                      src={mediaUrl}
                      alt="Yuklangan rasm"
                      className="h-28 w-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
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
                      disabled={isUploading}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 transition-colors"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-finora-600" />
                      ) : (
                        <UploadCloud className="h-4 w-4 text-finora-600" />
                      )}
                      <span>{isUploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                    </button>

                    <span className="text-[11px] text-slate-400">yoki URL:</span>
                    <input
                      type="url"
                      placeholder="https://... rasm havolasi"
                      value={mediaUrl}
                      onChange={e => setMediaUrl(e.target.value)}
                      className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-finora-500 focus:outline-hidden dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* 4. Live Mobile Chat Preview */}
              {(text || mediaUrl) && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                    <Eye className="h-3.5 w-3.5 text-finora-600" />
                    <span>Foydalanuvchi ekranida qanday ko'rinadi:</span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-4 dark:border-dark-border dark:bg-dark-cardSecondary/60">
                    <div className="flex items-start gap-2.5 max-w-sm">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-finora-600 text-white text-[11px] font-black shrink-0 shadow-xs">
                        F
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          Finora Qo'llab-quvvatlash
                        </span>
                        <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-dark-card p-3 shadow-sm border border-slate-200/80 dark:border-dark-border text-xs text-slate-800 dark:text-slate-100">
                          {mediaUrl && (
                            <img
                              src={mediaUrl}
                              alt="Media"
                              className="rounded-lg mb-2 max-h-36 w-full object-cover"
                            />
                          )}
                          <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                            <span>Hozir</span>
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Information Note */}
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <b>Muhim afzalligi:</b> Ushbu xabar barcha foydalanuvchilarning shaxsiy chatiga
                    tushadi va ularning telefoniga bildirishnoma boradi. Foydalanuvchi unga javob
                    yozsa, uning xabari to'g'ridan-to'g'ri admin panelingizdagi ushbu suhbatga
                    yetib keladi!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200/80 px-5 py-3.5 dark:border-dark-border bg-slate-50/70 dark:bg-dark-cardSecondary/50">
          {result ? (
            <button
              type="button"
              onClick={handleClose}
              className="ml-auto flex items-center gap-2 rounded-xl bg-finora-600 px-5 py-2 text-xs font-bold text-white hover:bg-finora-700 transition-colors"
            >
              Yopish
            </button>
          ) : showConfirm ? (
            <div className="flex items-center justify-between w-full gap-3">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Haqiqatan ham barcha tanlangan foydalanuvchilar chatiga yuborilsinmi?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSending}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-dark-border dark:bg-dark-card dark:text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSending ? 'Yuborilmoqda...' : 'Ha, yuborilsin'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSending}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-dark-border dark:bg-dark-card dark:text-slate-300 transition-colors"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!text.trim() && !mediaUrl) {
                    setError("Iltimos, xabar matnini kiriting yoki rasm tanlang")
                    return
                  }
                  setShowConfirm(true)
                }}
                disabled={(!text.trim() && !mediaUrl) || isSending}
                className="flex items-center gap-2 rounded-xl bg-finora-600 px-5 py-2 text-xs font-bold text-white hover:bg-finora-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Xabarni yuborish</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
