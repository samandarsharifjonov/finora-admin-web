import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  BellRing,
  ShieldCheck,
  FileText,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserAvatar } from '../common/UserAvatar'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`

  const navItems = [
    {
      to: '/',
      label: 'Boshqaruv',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: '/users',
      label: 'Foydalanuvchilar',
      icon: Users,
    },
    {
      to: '/analytics',
      label: 'Analitika',
      icon: BarChart3,
    },
    {
      to: '/notifications',
      label: 'Xabarnomalar',
      icon: BellRing,
    },
    ...(user?.is_super_admin
      ? [
          {
            to: '/admins',
            label: 'Adminlar & Rollar',
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      to: '/terms',
      label: 'Foydalanish shartlari',
      icon: FileText,
    },
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
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-dark-border dark:bg-dark-card lg:static lg:translate-x-0',
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
            Asosiy Menyu
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
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User preview footer */}
        {user && (
          <div className="border-t border-slate-200 p-3.5 dark:border-dark-border">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-dark-cardSecondary border border-slate-200/60 dark:border-dark-border/60">
              <UserAvatar
                src={user.avatar_url}
                name={user.full_name}
                email={user.email}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {user.full_name || 'Admin'}
                </p>
                <p className="truncate text-[10.5px] text-slate-400">
                  {user.is_super_admin ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
