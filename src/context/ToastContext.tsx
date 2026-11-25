import React, { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextValue {
  toast: {
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_STYLES: Record<
  ToastType,
  {
    icon: React.FC<{ className?: string }>
    container: string
    iconClass: string
  }
> = {
  success: {
    icon: CheckCircle2,
    container:
      'border-emerald-200/90 bg-white/95 text-slate-900 dark:border-emerald-800/60 dark:bg-dark-card/95 dark:text-white',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    container:
      'border-rose-200/90 bg-white/95 text-slate-900 dark:border-rose-800/60 dark:bg-dark-card/95 dark:text-white',
    iconClass: 'text-rose-600 dark:text-rose-400',
  },
  warning: {
    icon: AlertTriangle,
    container:
      'border-amber-200/90 bg-white/95 text-slate-900 dark:border-amber-800/60 dark:bg-dark-card/95 dark:text-white',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    container:
      'border-sky-200/90 bg-white/95 text-slate-900 dark:border-sky-800/60 dark:bg-dark-card/95 dark:text-white',
    iconClass: 'text-sky-600 dark:text-sky-400',
  },
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts(prev => [...prev.slice(-4), { id, type, title, message }])
      setTimeout(() => dismiss(id), 4200)
    },
    [dismiss]
  )

  const toast = {
    success: (title: string, message?: string) => push('success', title, message),
    error: (title: string, message?: string) => push('error', title, message),
    warning: (title: string, message?: string) => push('warning', title, message),
    info: (title: string, message?: string) => push('info', title, message),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Stack */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      >
        {toasts.map(item => {
          const style = TOAST_STYLES[item.type]
          const Icon = style.icon
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-all duration-200 dark:shadow-black/40 ${style.container}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconClass}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-snug">{item.title}</p>
                {item.message && (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-dark-cardSecondary dark:hover:text-slate-200"
                aria-label="Yopish"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue['toast'] {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx.toast
}
