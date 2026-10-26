import React from 'react'
import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme()

  return (
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
      </div>
    </header>
  )
}
