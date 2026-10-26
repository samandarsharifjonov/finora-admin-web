export interface PermissionBadgeInfo {
  code: string
  label: string
  shortLabel: string
  color: string
}

export const PERMISSION_MAP: Record<string, PermissionBadgeInfo> = {
  'overview.view': {
    code: 'overview.view',
    label: 'Boshqaruv & Statistika',
    shortLabel: 'Statistika',
    color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/60',
  },
  'users.view': {
    code: 'users.view',
    label: 'Foydalanuvchilar ro‘yxati',
    shortLabel: 'Foydalanuvchilar',
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/60',
  },
  'users.block': {
    code: 'users.block',
    label: 'Akkauntni bloklash',
    shortLabel: 'Bloklash',
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/60',
  },
  'users.delete': {
    code: 'users.delete',
    label: 'Akkauntni o‘chirish',
    shortLabel: 'O‘chirish',
    color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/60',
  },
  'broadcast.send': {
    code: 'broadcast.send',
    label: 'Ommaviy xabarnomalar',
    shortLabel: 'Xabarnomalar',
    color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/60 dark:border-purple-900/60',
  },
  'categories.analytics': {
    code: 'categories.analytics',
    label: 'Toifalar tahlili',
    shortLabel: 'Toifalar',
    color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200/60 dark:border-teal-900/60',
  },
  'devices.analytics': {
    code: 'devices.analytics',
    label: 'Qurilmalar tahlili',
    shortLabel: 'Qurilmalar',
    color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/60',
  },
  'deletions.analytics': {
    code: 'deletions.analytics',
    label: 'O‘chirilganlar sababi',
    shortLabel: 'O‘chirilganlar',
    color: 'bg-slate-100 text-slate-700 dark:bg-dark-cardSecondary dark:text-slate-300 border-slate-200 dark:border-dark-border',
  },
  'terms.manage': {
    code: 'terms.manage',
    label: 'Shartlar PDF boshqaruvi',
    shortLabel: 'Shartlar (PDF)',
    color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200/60 dark:border-orange-900/60',
  },
  'support.chat': {
    code: 'support.chat',
    label: 'Qo‘llab-quvvatlash chati',
    shortLabel: 'Support Chat',
    color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-900/60',
  },
  'admin_panel.access': {
    code: 'admin_panel.access',
    label: 'Admin panelga kirish',
    shortLabel: 'Web kirish',
    color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/60',
  },
}

export function getPermissionInfo(code: string): PermissionBadgeInfo {
  return PERMISSION_MAP[code] || {
    code,
    label: code,
    shortLabel: code,
    color: 'bg-slate-100 text-slate-700 dark:bg-dark-cardSecondary dark:text-slate-300 border-slate-200 dark:border-dark-border',
  }
}
