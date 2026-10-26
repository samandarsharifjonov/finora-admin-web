import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface PermissionGuardProps {
  permission?: string | string[]
  superAdminOnly?: boolean
  children: React.ReactNode
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  superAdminOnly = false,
  children,
}) => {
  const { user, hasPermission } = useAuth()

  if (!user) {
    return null
  }

  // Super admin can access everything
  if (user.is_super_admin) {
    return <>{children}</>
  }

  // Super admin only check
  if (superAdminOnly) {
    return <AccessDeniedView reason="Ushbu bo'lim faqat Super Admin (Boshqaruvchi) uchun ochiq." />
  }

  // Specific permission check
  if (permission) {
    const perms = Array.isArray(permission) ? permission : [permission]
    const hasAny = perms.some(p => hasPermission(p))
    if (!hasAny) {
      return (
        <AccessDeniedView reason="Kechirasiz, sizda ushbu bo'limni ko'rish yoki boshqarish ruxsati mavjud emas." />
      )
    }
  }

  return <>{children}</>
}

const AccessDeniedView: React.FC<{ reason: string }> = ({ reason }) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Ruxsat etilmagan bo'lim
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {reason}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-finora-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-finora-700 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Bosh sahifaga qaytish
      </Link>
    </div>
  )
}
