import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-finora-100 text-finora-600 dark:bg-finora-950 dark:text-finora-400">
        <Sparkles className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">404</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Siz qidirayotgan sahifa topilmadi
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-finora-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-finora-700"
      >
        <ArrowLeft className="h-4 w-4" /> Bosh sahifaga qaytish
      </Link>
    </div>
  )
}
