import React, { useState } from 'react'
import { Ban, X, AlertTriangle } from 'lucide-react'

interface BlockUserModalProps {
  isOpen: boolean
  userName: string
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  userName,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onConfirm(reason.trim() || 'Qo‘pol muomala va qoidabuzarlik sababli')
      setReason('')
      onClose()
    } catch (err: any) {
      alert(err?.message || "Foydalanuvchini bloklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-dark-border dark:bg-dark-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-100 p-2.5 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Foydalanuvchini bloklash
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2 border border-amber-200/60 dark:border-amber-900/40">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Bloklangan foydalanuvchi support chatiga yangi xabar yoza olmaydi, lekin eski suhbat tarixini ko'rishi mumkin.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Bloklash sababi:
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Masalan: Qo‘pol muomala, spam xabarlar yoki firibgarlik..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-finora-500 focus:bg-white focus:ring-4 focus:ring-finora-500/10 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? 'Bloklanmoqda...' : 'Bloklash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
