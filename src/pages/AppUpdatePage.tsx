import React, { useEffect, useState } from 'react'
import {
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Save,
  Tag,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Download,
  Clock,
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import type { AppUpdateConfig } from '../types'
import { formatDate } from '../lib/utils'

export const AppUpdatePage: React.FC = () => {
  const [config, setConfig] = useState<AppUpdateConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form states
  const [version, setVersion] = useState('1.2.0+26')
  const [title, setTitle] = useState('Yangi versiya mavjud!')
  const [releaseNotes, setReleaseNotes] = useState('')
  const [isForceUpdate, setIsForceUpdate] = useState(false)
  const [isOptionalUpdate, setIsOptionalUpdate] = useState(false)
  const [playStoreUrl, setPlayStoreUrl] = useState('https://play.google.com/store/apps/details?id=uz.finora.app')
  const [appStoreUrl, setAppStoreUrl] = useState('https://apps.apple.com/app/finora/id000000000')

  const fetchConfig = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest<any>('/admin/app/version')
      let data = res?.data || res
      while (data && data.data && typeof data.data === 'object') {
        data = data.data
      }
      if (data) {
        setConfig(data)
        setVersion(data.latest_version || '1.2.0+26')
        setTitle(data.title || 'Yangi versiya mavjud!')
        setReleaseNotes(data.release_notes || '')
        setIsForceUpdate(Boolean(data.is_force_update))
        setIsOptionalUpdate(Boolean(data.is_optional_update))
        if (data.play_store_url) setPlayStoreUrl(data.play_store_url)
        if (data.app_store_url) setAppStoreUrl(data.app_store_url)
      }
    } catch (err: any) {
      setError(err?.message || "Ilova versiya ma'lumotlarini yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleToggleForce = () => {
    const nextVal = !isForceUpdate
    setIsForceUpdate(nextVal)
    if (nextVal) {
      setIsOptionalUpdate(false)
    }
  }

  const handleToggleOptional = () => {
    const nextVal = !isOptionalUpdate
    setIsOptionalUpdate(nextVal)
    if (nextVal) {
      setIsForceUpdate(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!version.trim()) {
      setError("Iltimos, ilovaning yangi versiya raqamini kiriting")
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = {
        latest_version: version.trim(),
        min_version: version.trim(),
        is_force_update: isForceUpdate,
        is_optional_update: isOptionalUpdate,
        title: title.trim(),
        release_notes: releaseNotes.trim(),
        play_store_url: playStoreUrl.trim(),
        app_store_url: appStoreUrl.trim(),
      }

      const res = await apiRequest('/admin/app/version', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      let updated: any = res?.data || res || payload
      while (updated && updated.data && typeof updated.data === 'object') {
        updated = updated.data
      }
      setConfig(updated)
      setSuccessMsg("Ilova yangilanish sozlamalari muvaffaqiyatli saqlandi!")
      setTimeout(() => setSuccessMsg(null), 5000)
    } catch (err: any) {
      setError(err?.message || "Sozlamalarni saqlashda xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-finora-500/10 text-finora-600 dark:bg-finora-500/20 dark:text-finora-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Ilova yangilanishi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Mobil ilovaning rasmiy versiyasi, majburiy/ixtiyoriy yangilanish holati va do'kon havolalari boshqaruvi
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchConfig}
          disabled={loading}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Yangilash
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Status Summary Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Active Mode */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isForceUpdate
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                : isOptionalUpdate
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-dark-cardSecondary dark:text-slate-400'
            }`}
          >
            {isForceUpdate ? (
              <ShieldAlert className="h-5 w-5" />
            ) : isOptionalUpdate ? (
              <Sparkles className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Joriy rejim
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {isForceUpdate
                ? 'Majburiy yangilash'
                : isOptionalUpdate
                ? 'Ixtiyoriy yangilash'
                : 'Yangilanish o‘chirilgan'}
            </div>
          </div>
        </div>

        {/* Card 2: Server Version */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Serverdagi so‘nggi versiya
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              v{config?.latest_version || version || '1.2.0+26'}
            </div>
          </div>
        </div>

        {/* Card 3: Last updated */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Oxirgi yangilangan vaqti
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {config?.updated_at ? formatDate(config.updated_at) : 'Hozircha saqlanmagan'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card"
        >
            <div className="border-b border-slate-100 pb-4 dark:border-dark-border">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Yangilanish parametrlari
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                O'zgarishlar mobil ilova foydalanuvchilariga avtomatik ta'sir ko'rsatadi
              </p>
            </div>

            {/* Version Input */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>Yangilangan versiya raqami</span>
                <span className="font-normal text-slate-400">Build raqami bilan (+26)</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Tag className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="Masalan: 1.2.0+26"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 transition-colors focus:border-finora-500 focus:bg-white focus:outline-none dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white dark:focus:border-finora-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                Masalan, agar ilova <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 dark:bg-dark-cardSecondary dark:text-slate-300">1.2.0+25</code> bo'lsa, uni <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 dark:bg-dark-cardSecondary dark:text-slate-300">1.2.0+26</code> qilib kiritsangiz, ilova yangi versiya chiqqanini aniqlaydi.
              </p>
            </div>

            {/* Title Input */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Yangilanish sarlavhasi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Yangi versiya mavjud!"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 transition-colors focus:border-finora-500 focus:bg-white focus:outline-none dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white dark:focus:border-finora-500"
              />
            </div>

            {/* Release Notes Textarea */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                Yangilanish haqida qisqacha (Release Notes)
              </label>
              <textarea
                rows={4}
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="Yangi imkoniyatlar, qulayliklar va tizim barqarorligi haqida qisqacha yozing..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 transition-colors focus:border-finora-500 focus:bg-white focus:outline-none dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white dark:focus:border-finora-500"
              />
            </div>

            {/* Switches Section (Clean with no subtitles as requested) */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Yangilanish turi (faqat birini yoqish mumkin):
              </label>

              {/* Switch 1: Majburiy yangilash */}
              <div
                onClick={handleToggleForce}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                  isForceUpdate
                    ? 'border-rose-400 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-dark-border dark:bg-dark-cardSecondary/50 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isForceUpdate
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-400 dark:bg-dark-cardSecondary dark:text-slate-500'
                    }`}
                  >
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Majburiy yangilash
                  </span>
                </div>

                {/* Switch Toggle UI */}
                <div
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isForceUpdate ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isForceUpdate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Switch 2: Ixtiyoriy yangilash */}
              <div
                onClick={handleToggleOptional}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                  isOptionalUpdate
                    ? 'border-emerald-400 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-dark-border dark:bg-dark-cardSecondary/50 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isOptionalUpdate
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 dark:bg-dark-cardSecondary dark:text-slate-500'
                    }`}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Ixtiyoriy yangilash
                  </span>
                </div>

                {/* Switch Toggle UI */}
                <div
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isOptionalUpdate ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isOptionalUpdate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Store URLs */}
            <div className="space-y-3.5 pt-2">
              {/* Play Store URL (Android) */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Play Store havolasi (Android)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Download className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={playStoreUrl}
                    onChange={(e) => setPlayStoreUrl(e.target.value)}
                    placeholder="https://play.google.com/store/apps/details?id=uz.finora.app"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 transition-colors focus:border-finora-500 focus:bg-white focus:outline-none dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white dark:focus:border-finora-500"
                  />
                </div>
              </div>

              {/* App Store URL (iOS) */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                  App Store havolasi (iOS)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    value={appStoreUrl}
                    onChange={(e) => setAppStoreUrl(e.target.value)}
                    placeholder="https://apps.apple.com/app/finora/id..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 transition-colors focus:border-finora-500 focus:bg-white focus:outline-none dark:border-dark-border dark:bg-dark-cardSecondary dark:text-white dark:focus:border-finora-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-finora-600 py-3 text-sm font-bold text-white shadow-md shadow-finora-600/20 transition-all hover:bg-finora-700 active:scale-[0.99] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Sozlamalarni saqlash</span>
                  </>
                )}
              </button>
            </div>
          </form>
      </div>
    </div>
  )
}

export default AppUpdatePage
