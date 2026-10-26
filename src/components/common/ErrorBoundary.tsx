import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = import.meta.env.BASE_URL || '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center dark:bg-dark-bg sm:p-6">
          <div className="w-full max-w-md rounded-3xl border border-rose-200/80 bg-white p-7 shadow-xl dark:border-rose-900/50 dark:bg-dark-card sm:p-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-900/50 dark:text-rose-400">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Kutilmagan xatolik yuz berdi
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {this.state.error?.message || "Sahifa yuklanishida xatolik yuz berdi. Iltimos, sahifani yangilang."}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-finora-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-finora-700 active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Qayta yuklash</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Bosh sahifaga</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
