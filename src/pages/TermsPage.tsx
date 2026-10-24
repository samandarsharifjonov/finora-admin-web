import React, { useEffect, useState } from 'react'
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { apiRequest, getBaseApiUrl } from '../lib/api'
import { formatDate } from '../lib/utils'

export const TermsPage: React.FC = () => {
  const [terms, setTerms] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchTerms = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest('/admin/terms')
      setTerms(res)
    } catch (err: any) {
      setError(err?.message || "Foydalanish shartlarini yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTerms()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      await apiRequest('/admin/terms/upload', {
        method: 'POST',
        body: formData,
      })
      setSuccessMsg("Foydalanish shartlari PDF fayli muvaffaqiyatli yangilandi!")
      setSelectedFile(null)
      fetchTerms()
    } catch (err: any) {
      setError(err?.message || "PDF faylni yuklashda xatolik")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Foydalanish shartlari PDF faylini butunlay o'chirmoqchimisiz?")) return
    try {
      await apiRequest('/admin/terms', { method: 'DELETE' })
      setTerms(null)
      setSuccessMsg("Fayl o'chirildi")
    } catch (err: any) {
      alert(err?.message || "O'chirishda xatolik")
    }
  }

  const pdfUrl = `${getBaseApiUrl().replace(/\/+$/, '')}/terms/view`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Foydalanish Shartlari (Terms of Service)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Ilovada ko'rsatiladigan rasmiy shartlar va maxfiylik siyosati PDF fayli boshqaruvi
          </p>
        </div>

        <button
          onClick={fetchTerms}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Yangilash
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Current status card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
            Joriy Holat
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Yuklanmoqda...</div>
          ) : terms?.exists ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-dark-cardSecondary">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {terms.filename || 'terms.pdf'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Oxirgi yangilangan: {formatDate(terms.updated_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-finora-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-finora-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> PDF ni ko'rish
                </a>

                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" /> O'chirish
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Hozircha PDF fayl yuklanmagan
            </div>
          )}
        </div>

        {/* Upload form card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
            Yangi PDF Yuklash
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-finora-500 dark:border-dark-border">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-finora-50 file:text-finora-700 hover:file:bg-finora-100 dark:file:bg-finora-950 dark:file:text-finora-400"
              />
              <p className="mt-2 text-[10px] text-slate-400">
                Faqat .pdf formatidagi fayllar qabul qilinadi (maks. 10 MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-finora-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-finora-700 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Yuklanmoqda...' : 'Serverga yuklash'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
