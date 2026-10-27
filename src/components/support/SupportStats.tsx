import React from 'react'
import { MessageSquare, Bell, Wifi, Ban } from 'lucide-react'
import type { SupportStatsSummary } from '../../types/support'

interface SupportStatsProps {
  stats: SupportStatsSummary
}

export const SupportStats: React.FC<SupportStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Jami suhbatlar',
      value: stats.totalChats.toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/60',
      desc: 'Barcha murojaat qilganlar',
    },
    {
      title: 'O‘qilmagan xabarlar',
      value: stats.unreadChats.toLocaleString(),
      icon: Bell,
      color: stats.unreadChats > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400',
      bg: stats.unreadChats > 0 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/60' : 'bg-slate-50 dark:bg-dark-cardSecondary border-slate-200/60 dark:border-dark-border',
      desc: 'Javob kutayotgan chatlar',
      hasBadge: stats.unreadChats > 0,
    },
    {
      title: 'Onlayn foydalanuvchilar',
      value: stats.onlineUsers.toLocaleString(),
      icon: Wifi,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/60',
      desc: 'Hozir tarmoqdagi mijozlar',
      isPulse: stats.onlineUsers > 0,
    },
    {
      title: 'Bloklangan foydalanuvchilar',
      value: stats.blockedUsers.toLocaleString(),
      icon: Ban,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/60',
      desc: 'Supportdan cheklanganlar',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(c => {
        const Icon = c.icon
        return (
          <div
            key={c.title}
            className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all ${c.bg}`}
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{c.title}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {c.value}
                </span>
                {c.hasBadge && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 animate-pulse">
                    Yangi
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">{c.desc}</p>
            </div>
            <div className={`relative rounded-xl p-2.5 ${c.color} bg-white/70 dark:bg-slate-900/50 shadow-xs`}>
              <Icon className="h-5 w-5" />
              {c.isPulse && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
