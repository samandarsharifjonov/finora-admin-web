import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Headphones,
  BarChart3,
  BellRing,
  ShieldCheck,
  ShieldAlert,
  Receipt,
  FileText,
  Smartphone,
  ScrollText,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserAvatar } from '../common/UserAvatar'
import { cn } from '../../lib/utils'
import { fetchAdminUnreadCount } from '../../lib/supportApi'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavItem {
  to: string
  label: string
  icon: React.FC<{ className?: string }>
  exact?: boolean
  badge?: number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
}) => {
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
  const canAppUpdate = hasPermission('app_update.manage') || user?.is_super_admin
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

  const navGroups: NavGroup[] = [
    {
      title: 'Asosiy',
      items: [
        ...(canOverview
          ? [{ to: '/', label: 'Boshqaruv', icon: LayoutDashboard, exact: true }]
          : []),
        ...(canAnalytics
          ? [{ to: '/analytics', label: 'Analitika', icon: BarChart3 }]
          : []),
      ],
    },
    {
      title: 'Mijozlar va Aloqa',
      items: [
        ...(canUsers
          ? [{ to: '/users', label: 'Foydalanuvchilar', icon: Users }]
          : []),
        ...(canUsers || canOverview || isSuperAdmin
          ? [{ to: '/receipts', label: 'Soliq OFD Cheklari', icon: Receipt }]
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
        ...(canBroadcast
          ? [{ to: '/notifications', label: 'Xabarnomalar', icon: BellRing }]
          : []),
      ],
    },
    {
      title: 'Tizim va Xavfsizlik',
      items: [
        ...(isSuperAdmin
          ? [
              {
                to: '/protected-users',
                label: 'Himoyalangan hisoblar',
                icon: ShieldAlert,
              },
              {
                to: '/admins',
                label: 'Adminlar va rollar',
                icon: ShieldCheck,
              },
              {
                to: '/audit-logs',
                label: 'Adminlar harakati',
                icon: ScrollText,
              },
            ]
          : []),
        ...(canTerms
          ? [{ to: '/terms', label: 'Foydalanish shartlari', icon: FileText }]
          : []),
        ...(canAppUpdate
          ? [{ to: '/app-update', label: 'Ilova yangilanishi', icon: Smartphone }]
          : []),
      ],
    },
  ].filter(group => group.items.length > 0)

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-slate-200/90 bg-white transition-all duration-200 ease-in-out dark:border-dark-border dark:bg-dark-card lg:static lg:h-full lg:translate-x-0',
          collapsed ? 'lg:w-[76px] w-64' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-slate-200/80 dark:border-dark-border',
            collapsed ? 'justify-between px-4 lg:justify-center lg:px-2' : 'justify-between px-4'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logoUrl}
              alt="Finora"
              className="h-9 w-9 shrink-0 rounded-xl border border-slate-200/80 object-cover shadow-2xs dark:border-dark-border"
            />
            <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Finora
                </span>
                <span className="rounded-md border border-finora-500/30 bg-finora-500/15 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-finora-700 dark:text-finora-400">
                  ADMIN
                </span>
              </div>
              <p className="truncate text-[10.5px] text-slate-400">Boshqaruv markazi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Menyuni yopish"
          >
            <X className="h-5 w-5" />
          </button>

          {onToggleCollapse && !collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Menyuni yig'ish"
              className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-dark-cardSecondary dark:hover:text-slate-200 lg:inline-flex"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {navGroups.map(group => (
            <div key={group.title} className="space-y-1">
              <div
                className={cn(
                  'px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500',
                  collapsed && 'lg:hidden'
                )}
              >
                {group.title}
              </div>
              {group.items.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                        collapsed && 'lg:justify-center lg:px-0',
                        isActive
                          ? 'bg-finora-500 text-slate-950 font-bold shadow-sm shadow-finora-500/25'
                          : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-cardSecondary dark:hover:text-slate-100'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className={cn('flex-1 truncate', collapsed && 'lg:hidden')}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={cn(
                          'rounded-full bg-rose-500 px-1.5 py-0.5 text-[9.5px] font-black leading-none text-white shadow-xs',
                          collapsed && 'lg:absolute lg:right-1.5 lg:top-1.5 lg:px-1 lg:text-[8px]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Expand button when collapsed */}
        {onToggleCollapse && collapsed && (
          <div className="hidden justify-center border-t border-slate-200/80 py-2.5 dark:border-dark-border lg:flex">
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Menyuni kengaytirish"
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-dark-cardSecondary dark:hover:text-slate-200"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* User preview footer */}
        {user && (
          <div className="border-t border-slate-200/80 p-3 dark:border-dark-border space-y-2">
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 p-2 dark:border-dark-border/60 dark:bg-dark-cardSecondary/80',
                collapsed && 'lg:justify-center lg:p-1.5'
              )}
            >
              <UserAvatar
                src={user.avatar_url}
                name={user.full_name}
                email={user.email}
                size="md"
              />
              <div className={cn('min-w-0 flex-1', collapsed && 'lg:hidden')}>
                <p
                  className="truncate text-xs font-bold text-slate-900 dark:text-white"
                  title={user.full_name || 'Admin'}
                >
                  {user.full_name || 'Admin'}
                </p>
                <p
                  className="truncate text-[10.5px] text-slate-500 dark:text-slate-400"
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
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200/90 bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60',
                collapsed && 'lg:px-0'
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn(collapsed && 'lg:hidden')}>Chiqish</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
