import React, { useEffect } from 'react'
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react'

export type ConfirmVariant = 'danger' | 'warning' | 'info'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: React.ReactNode
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  {
    icon: React.FC<{ className?: string }>
    iconWrap: string
    confirmBtn: string
  }
> = {
  danger: {
    icon: ShieldAlert,
    iconWrap: 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    confirmBtn:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/30 shadow-sm shadow-rose-600/20',
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    confirmBtn:
      'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500/30 shadow-sm shadow-amber-600/20',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-finora-500/15 text-finora-700 dark:bg-finora-500/20 dark:text-finora-400',
    confirmBtn:
      'bg-finora-500 text-slate-950 hover:bg-finora-400 focus:ring-finora-500/30 shadow-sm shadow-finora-500/20',
  },
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Tasdiqlash',
  cancelLabel = 'Bekor qilish',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  children,
}) => {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, loading, onCancel])

  if (!open) return null

  const cfg = VARIANT_CONFIG[variant]
  const Icon = cfg.icon

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={() => {
        if (!loading) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-slate-900/20 dark:border-dark-border dark:bg-dark-card dark:shadow-black/60"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.iconWrap}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h3>
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-cardSecondary dark:hover:text-slate-200 disabled:opacity-50"
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all focus:outline-none focus:ring-4 disabled:opacity-60 ${cfg.confirmBtn}`}
          >
            {loading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
