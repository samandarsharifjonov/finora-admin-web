import React, { useState } from 'react'
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  Radio,
  Settings,
  Check,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getBaseApiUrl, setBaseApiUrl } from '../../lib/api'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [apiUrl, setApiUrl] = useState(getBaseApiUrl())
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault()
    setBaseApiUrl(apiUrl.trim())
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      setIsSettingsOpen(false)
      window.location.reload()
    }, 600)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/80 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline-block">
              Server holati: Onlayn
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Endpoint Config button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="API Manzilini sozlash"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Radio className="h-3.5 w-3.5 text-finora-500" />
            <span className="hidden md:inline">API</span>
          </button>

          {/* Dark / Light toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 dark:hover:bg-slate-800"
            title="Mavzuni almashtirish"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-dark-border">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                {user?.full_name || 'Admin'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {user?.email}
              </div>
            </div>

            <button
              onClick={logout}
              title="Tizimdan chiqish"
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* API URL modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-dark-border dark:bg-dark-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-finora-100 text-finora-600 dark:bg-finora-950 dark:text-finora-400">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Backend API Manzili
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  So'rovlar yuboriladigan asosiy server URL manzili
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveApiUrl} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Base API URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={e => setApiUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-finora-500 focus:ring-2 focus:ring-finora-500/20 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white"
                  placeholder="https://...up.railway.app/api/v1"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApiUrl('https://api-production-9127.up.railway.app/api/v1')}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 dark:bg-dark-cardSecondary dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Railway Production
                </button>
                <button
                  type="button"
                  onClick={() => setApiUrl('http://localhost:8080/api/v1')}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 dark:bg-dark-cardSecondary dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Localhost (8080)
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-finora-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-finora-500/25 hover:bg-finora-600"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="h-4 w-4" /> Saqlandi
                    </>
                  ) : (
                    'Saqlash & Yangilash'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
