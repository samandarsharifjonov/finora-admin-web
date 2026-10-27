import React from 'react'
import { Sparkles, X, MessageSquareQuote } from 'lucide-react'

interface QuickRepliesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (text: string) => void
}

const CANNED_REPLIES = [
  {
    title: 'Xush kelibsiz & Salomlashish',
    text: "Assalomu alaykum! Finora qo'llab-quvvatlash xizmatiga xush kelibsiz. Sizga qanday yordam bera olamiz?",
  },
  {
    title: 'Ilovani yangilash',
    text: "Iltimos, ilovangizni oxirgi versiyaga yangilab ko'ring va qaytadan tizimga kirib tekshirib ko'ring.",
  },
  {
    title: 'Chek skanerlash muammosi',
    text: "Chekni skanerlashda yorug'lik yetarli bo'lishiga, barcha yozuvlar va QR-kod to'liq kadrga sig'ishiga e'tibor bering.",
  },
  {
    title: 'Tranzaksiya / Balans to‘g‘rilandi',
    text: "Hisobingiz ma'lumotlari tekshirildi va qayta sinxronizatsiya qilindi. Iltimos, balansingizni qayta tekshirib oling.",
  },
  {
    title: 'Texnik bo‘limga yo‘naltirildi',
    text: "Siz murojaat qilgan masala dasturchilar guruhiga uzatildi. Tez orada tekshirib, natijasini xabar qilamiz.",
  },
  {
    title: 'Minnatdorchilik',
    text: "Murojaatingiz va fikr-mulohazangiz uchun tashakkur! Finora bilan birga ekanligingizdan mamnunmiz.",
  },
]

export const QuickRepliesModal: React.FC<QuickRepliesModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-dark-border dark:bg-dark-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-finora-500/15 p-1.5 text-finora-600 dark:text-finora-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tezkor javob shablonlari
              </h3>
              <p className="text-[11px] text-slate-400">
                1 ta bosish orqali xabarni chat maydoniga joylang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3.5 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {CANNED_REPLIES.map(item => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                onSelect(item.text)
                onClose()
              }}
              className="flex w-full flex-col items-start rounded-xl border border-slate-200/70 p-3 text-left transition-colors hover:border-finora-500/50 hover:bg-finora-50/40 dark:border-dark-border dark:hover:bg-dark-cardSecondary"
            >
              <div className="flex items-center gap-1.5">
                <MessageSquareQuote className="h-3.5 w-3.5 text-finora-600 dark:text-finora-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.title}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                "{item.text}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
