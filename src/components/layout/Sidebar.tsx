import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Headphones,
  BarChart3,
  BellRing,
  ShieldCheck,
  FileText,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserAvatar } from '../common/UserAvatar'
import { cn } from '../../lib/utils'
import { fetchAdminUnreadCount } from '../../lib/supportApi'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, hasPermission, logout } = useAuth()
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`
  const [supportUnread, setSupportUnread] = useState(0)

  const canOverview = hasPermission('overview.view')
  const canUsers = hasPermission('users.view')
  const canSupport = hasPermission('support.chat') || user?.is_super_admin
  const canAnalytics =
    hasPermission('categories.analytics') ||
    hasPermission('devices.analytics') ||
    hasPermission('deletions.analytics')
  const canBroadcast = hasPermission('broadcast.send')
  const canTerms = hasPermission('terms.manage')
  const isSuperAdmin = user?.is_super_admin ?? false

  useEffect(() => {
    if (!canSupport) return
    const checkUnread = async () => {
      const count = await fetchAdminUnreadCount()
      setSupportUnread(count)
    }
    checkUnread()
    const timer = setInterval(checkUnread, 20000)
    return () => clearInterval(timer)
  }, [canSupport])

  const navItems = [
    ...(canOverview
      ? [
          {
            to: '/',
            label: 'Boshqaruv',
            icon: LayoutDashboard,
            exact: true,
          },
        ]
      : []),
    ...(canUsers
      ? [
          {
            to: '/users',
            label: 'Foydalanuvchilar',
            icon: Users,
          },
        ]
      : []),
    ...(canSupport
      ? [
          {
            to: '/support',
            label: 'Murojaatlar',
            icon: Headphones,
            badge: supportUnread,
          },
        ]
      : []),
    ...(canAnalytics
      ? [
          {
            to: '/analytics',
            label: 'Analitika',
            icon: BarChart3,
          },
        ]
      : []),
    ...(canBroadcast
      ? [
          {
            to: '/notifications',
            label: 'Xabarnomalar',
            icon: BellRing,
          },
        ]
      : []),
    ...(isSuperAdmin
      ? [
          {
            to: '/admins',
            label: 'Adminlar va rollar',
            icon: ShieldCheck,
          },
        ]
      : []),
    ...(canTerms
      ? [
          {
            to: '/terms',
            label: 'Foydalanish shartlari',
            icon: FileText,
          },
        ]
      : []),
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-dark-border dark:bg-dark-card lg:static lg:h-full lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Finora"
              className="h-9 w-9 rounded-xl object-cover border border-slate-200/80 dark:border-dark-border shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  Finora
                </span>
                <span className="rounded-md bg-finora-500/15 px-1.5 py-0.5 text-[9.5px] font-black text-finora-700 dark:text-finora-400 border border-finora-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400">
                Boshqaruv markazi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3.5">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Asosiy menyu
          </div>
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors duration-150',
                    isActive
                      ? 'bg-finora-500 text-slate-950 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-cardSecondary dark:hover:text-slate-200'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9.5px] font-black text-white shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User preview footer */}
        {user && (
          <div className="border-t border-slate-200 p-3.5 dark:border-dark-border space-y-2.5">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-dark-cardSecondary border border-slate-200/60 dark:border-dark-border/60">
              <UserAvatar
                src={user.avatar_url}
                name={user.full_name}
                email={user.email}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs font-semibold text-slate-900 dark:text-white"
                  title={user.full_name || 'Admin'}
                >
                  {user.full_name || 'Admin'}
                </p>
                <p
                  className="truncate text-[11px] text-slate-500 dark:text-slate-400"
                  title={user.email}
                >
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose()
                logout()
              }}
              title="Tizimdan chiqish"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60"
            >
              <LogOut className="h-4 w-4" />
              <span>Chiqish</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
