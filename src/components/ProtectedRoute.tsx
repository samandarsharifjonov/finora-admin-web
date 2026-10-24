import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sparkles } from 'lucide-react'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-gradient-to-tr from-finora-600 to-indigo-500 shadow-xl shadow-finora-500/30">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
          Finora Admin Hub yuklanmoqda...
        </p>
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (!user.is_admin && !user.is_super_admin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
