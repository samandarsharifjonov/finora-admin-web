import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Sun,
  Moon,
  Search,
  LayoutDashboard,
  Users,
  Receipt,
  Headphones,
  BarChart3,
  BellRing,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Smartphone,
  ScrollText,
  ArrowRight,
  X,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

interface RouteMeta {
  title: string
  subtitle: string
}

function getRouteMeta(pathname: string): RouteMeta {
  if (pathname === '/') {
    return { title: 'Boshqaruv paneli', subtitle: 'Tizimning umumiy ko‘rsatkichlari' }
  }
  if (pathname.startsWith('/users/')) {
    return { title: 'Foydalanuvchi profili', subtitle: 'Batafsil ma’lumot va faollik' }
  }
  if (pathname.startsWith('/users')) {
    return { title: 'Foydalanuvchilar', subtitle: 'Ro‘yxat, qidiruv va boshqaruv' }
  }
  if (pathname.startsWith('/receipts')) {
    return { title: 'Soliq OFD Cheklari', subtitle: 'Skanerlangan fiskal cheklar' }
  }
  if (pathname.startsWith('/support')) {
    return { title: 'Murojaatlar', subtitle: 'Foydalanuvchilar bilan jonli chat' }
  }
  if (pathname.startsWith('/analytics')) {
    return { title: 'Tizim analitikasi', subtitle: 'Toifalar, qurilmalar va o‘chirishlar' }
  }
  if (pathname.startsWith('/notifications')) {
    return { title: 'Xabarnomalar va yangiliklar', subtitle: 'Push va ommaviy xabar yuborish' }
  }
  if (pathname.startsWith('/protected-users')) {
    return { title: 'Himoyalangan hisoblar', subtitle: 'Maxsus himoya ostidagi profillar' }
  }
  if (pathname.startsWith('/admins')) {
    return { title: 'Adminlar va rollar', subtitle: 'Ruxsatlar va kirish nazorati' }
  }
  if (pathname.startsWith('/audit-logs')) {
    return { title: 'Adminlar harakati', subtitle: 'Adminlar bajargan amallar oqimi (Super Admin)' }
  }
  if (pathname.startsWith('/terms')) {
    return { title: 'Foydalanish shartlari', subtitle: 'Huquqiy hujjatlar tahriri' }
  }
  if (pathname.startsWith('/app-update')) {
    return { title: 'Ilova yangilanishi', subtitle: 'Mobil versiya va majburiy yangilash' }
  }
  return { title: 'Finora Admin', subtitle: 'Boshqaruv markazi' }
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme()
  const { user, hasPermission } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [paletteOpen, setPaletteOpen] = useState(false)
  const [query, setQuery] = useState('')

  const meta = getRouteMeta(location.pathname)

  const quickLinks = useMemo(() => {
    const isSuperAdmin = user?.is_super_admin ?? false
    const items = [
      ...(hasPermission('overview.view')
        ? [{ to: '/', label: 'Boshqaruv paneli', desc: 'Asosiy KPI va grafiklar', icon: LayoutDashboard }]
        : []),
      ...(hasPermission('users.view')
        ? [{ to: '/users', label: 'Foydalanuvchilar', desc: 'Barcha mijozlar ro‘yxati', icon: Users }]
        : []),
      ...(hasPermission('users.view') || hasPermission('overview.view') || isSuperAdmin
        ? [{ to: '/receipts', label: 'Soliq OFD Cheklari', desc: 'Fiskal cheklar monitoringi', icon: Receipt }]
        : []),
      ...(hasPermission('support.chat') || isSuperAdmin
        ? [{ to: '/support', label: 'Murojaatlar', desc: 'Qo‘llab-quvvatlash chati', icon: Headphones }]
        : []),
      ...(hasPermission('categories.analytics') ||
      hasPermission('devices.analytics') ||
      hasPermission('deletions.analytics')
        ? [{ to: '/analytics', label: 'Analitika', desc: 'Toifa va qurilmalar tahlili', icon: BarChart3 }]
        : []),
      ...(hasPermission('broadcast.send')
        ? [{ to: '/notifications', label: 'Xabarnomalar', desc: 'Push xabar yuborish', icon: BellRing }]
        : []),
      ...(isSuperAdmin
        ? [
            { to: '/protected-users', label: 'Himoyalangan hisoblar', desc: 'VIP / himoyalangan profillar', icon: ShieldAlert },
            { to: '/admins', label: 'Adminlar va rollar', desc: 'Jamoa ruxsatlari', icon: ShieldCheck },
            { to: '/audit-logs', label: 'Adminlar harakati', desc: 'Adminlar harakatlari oqimi', icon: ScrollText },
          ]
        : []),
      ...(hasPermission('terms.manage')
        ? [{ to: '/terms', label: 'Foydalanish shartlari', desc: 'Oferta va maxfiylik', icon: FileText }]
        : []),
      ...(hasPermission('app_update.manage') || isSuperAdmin
        ? [{ to: '/app-update', label: 'Ilova yangilanishi', desc: 'Versiya nazorati', icon: Smartphone }]
        : []),
    ]
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      item => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    )
  }, [user, hasPermission, query])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/85 px-4 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/85 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-dark-cardSecondary lg:hidden"
            aria-label="Menyuni ochish"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-base">
                {meta.title}
              </h2>
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Onlayn
              </span>
            </div>
            <p className="hidden truncate text-[11px] text-slate-500 dark:text-slate-400 sm:block">
              {meta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Command Palette Trigger */}
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setPaletteOpen(true)
            }}
            className="hidden items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-dark-border dark:bg-dark-cardSecondary/80 dark:text-slate-400 dark:hover:bg-slate-800 sm:flex"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Tezkor o‘tish...</span>
            <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:border-dark-border dark:bg-dark-card dark:text-slate-400">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              setQuery('')
              setPaletteOpen(true)
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 sm:hidden"
            title="Tezkor qidiruv"
          >
            <Search className="h-4 w-4" />
          </button>

          {user && (
            <span className="hidden rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 xl:inline-flex">
              {user.is_super_admin ? 'Super Admin' : 'Admin'}
            </span>
          )}

          {/* Dark / Light toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200/90 bg-slate-50/90 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 dark:hover:bg-slate-800"
            title="Mavzuni almashtirish"
            aria-label="Mavzuni almashtirish"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Command Palette Modal */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-4 pt-20 backdrop-blur-xs"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-card"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-dark-border">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Bo‘lim nomini yozing..."
                className="flex-1 bg-transparent text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-cardSecondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {quickLinks.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  Mos bo‘lim topilmadi
                </p>
              ) : (
                quickLinks.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => {
                        navigate(item.to)
                        setPaletteOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-dark-cardSecondary"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-finora-500/15 text-finora-700 dark:text-finora-400">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {item.label}
                          </p>
                          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
