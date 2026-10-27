import React, { useEffect, useState, useTransition } from 'react'
import {
  Receipt,
  Search,
  RefreshCw,
  Eye,
  X,
  CreditCard,
  Banknote,
  Building2,
  Calendar,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  QrCode,
  AlertCircle,
} from 'lucide-react'
import type { AdminReceiptDetail } from '../types'
import { fetchAdminReceipts, fetchAdminReceiptDetail } from '../lib/receiptsApi'
import { UserAvatar } from '../components/common/UserAvatar'
import { formatCurrency, formatDate } from '../lib/utils'

export const ReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<AdminReceiptDetail[]>([])
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [paymentType, setPaymentType] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<AdminReceiptDetail | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [, startTransition] = useTransition()

  const loadReceipts = async (newOffset = offset, searchQuery = search, payType = paymentType) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAdminReceipts({
        limit,
        offset: newOffset,
        search: searchQuery,
        payment_type: payType || undefined,
      })
      setReceipts(res.receipts || [])
      setTotal(res.total || 0)
    } catch (err: any) {
      setError(err?.message || "Cheklar ro'yxatini yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReceipts(offset, search, paymentType)
  }, [offset, limit, paymentType])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    startTransition(() => {
      setOffset(0)
      loadReceipts(0, val, paymentType)
    })
  }

  const handlePaymentTypeChange = (type: string) => {
    setPaymentType(type)
    setOffset(0)
  }

  const handleViewReceipt = async (receipt: AdminReceiptDetail) => {
    setSelectedReceipt(receipt)
    setModalLoading(true)
    try {
      const detail = await fetchAdminReceiptDetail(receipt.id)
      setSelectedReceipt(detail)
    } catch (err) {
      console.error("Chek tafsilotlarini yuklashda xatolik:", err)
    } finally {
      setModalLoading(false)
    }
  }

  // Calculated Stats
  const totalAmount = receipts.reduce((acc, r) => acc + (r.total_sum || 0), 0)
  const totalItems = receipts.reduce((acc, r) => acc + (r.item_count || 0), 0)
  const averageAmount = receipts.length > 0 ? totalAmount / receipts.length : 0

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Soliq OFD Cheklari
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <QrCode className="h-3 w-3" />
              OFD / Soliq
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Foydalanuvchilar tomonidan Soliq QR-kodi orqali skanerlangan barcha fiskal cheklar va xarid qilingan tovarlar monitoringi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadReceipts(offset, search, paymentType)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yangilash
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami skanerlangan</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {total.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Soliq bazasidagi cheklar</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sahifadagi aylanma</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalAmount)}
          </div>
          <span className="text-[11px] text-slate-400">{receipts.length} ta chek summasi</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">O'rtacha chek qiymati</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(averageAmount)}
          </div>
          <span className="text-[11px] text-slate-400">Har bitta xarid uchun</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tovar pozitsiyalari</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {totalItems.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Xarid qilingan mahsulotlar</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Do'kon nomi, STIR/TIN, fiskal belgi yoki foydalanuvchi qidirish..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: '', label: 'Barchasi' },
            { id: 'card', label: 'Karta (Karta / Humo / Uzcard)' },
            { id: 'cash', label: 'Naqd pul' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handlePaymentTypeChange(tab.id)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                paymentType === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Receipts Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                OFD Cheklari Ro'yxati
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {total} ta chek
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="mt-3 text-xs text-slate-400">Cheklar yuklanmoqda...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <Receipt className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">
              Cheklar topilmadi
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Qidiruv shartlariga mos keluvchi cheklar mavjud emas yoki foydalanuvchilar hali chek skaner qilishmagan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Savdo nuqtasi / Do'kon</th>
                  <th scope="col" className="px-6 py-3.5">Foydalanuvchi</th>
                  <th scope="col" className="px-6 py-3.5">Fiskal Ma'lumot</th>
                  <th scope="col" className="px-6 py-3.5">Sana</th>
                  <th scope="col" className="px-6 py-3.5">To'lov turi</th>
                  <th scope="col" className="px-6 py-3.5">Summa</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {receipts.map((rc) => {
                  const isCard = rc.payment_type?.toLowerCase().includes('card')
                  return (
                    <tr
                      key={rc.id}
                      className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {rc.merchant_name || 'Nomaʼlum savdo nuqtasi'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              STIR: <span className="font-mono">{rc.merchant_tin || '—'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={rc.user_avatar}
                            name={rc.user_full_name || rc.user_email}
                            className="h-8 w-8 text-[11px]"
                          />
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {rc.user_full_name || 'Nomaʼlum'}
                            </div>
                            <div className="text-[10px] text-slate-400">{rc.user_email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div>
                            FP: <span className="font-bold text-slate-700 dark:text-slate-300">{rc.fiscal_sign || '—'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ID: {rc.receipt_id || `ID-${rc.id}`}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(rc.receipt_date || rc.created_at)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isCard
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {isCard ? <CreditCard className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                          {isCard ? 'Bank kartasi' : 'Naqd pul'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 dark:text-white">
                          {formatCurrency(rc.total_sum)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {rc.item_count} ta mahsulot
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewReceipt(rc)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Chekni ko'rish
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {total > limit && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Jami {total} tadan {offset + 1}–{Math.min(offset + limit, total)} ko'rsatilmoqda
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Oldingi
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Keyingi
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Soliq OFD Receipt Inspector Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedReceipt.merchant_name || 'Fiskal Chek Tafsilotlari'}
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Soliq OFD
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    STIR: <span className="font-mono text-slate-600 dark:text-slate-300">{selectedReceipt.merchant_tin || '—'}</span> &bull; Fiskal belgi: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{selectedReceipt.fiscal_sign || '—'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Soliq Receipt Simulation Card */}
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
              <div className="flex flex-col gap-2 border-b border-dashed border-slate-300 pb-3 text-center dark:border-slate-700">
                <span className="text-xs font-bold tracking-widest text-slate-900 uppercase dark:text-white">
                  O'ZBEKISTON RESPUBLIKASI SOLIQ QO'MITASI
                </span>
                <span className="text-[11px] text-slate-500">
                  ONLAYN NAZORAT-KASSA MASHINASI CHEKI
                </span>
                <div className="text-[10px] text-slate-400">
                  Terminal ID: {selectedReceipt.terminal_id || 'N/A'} &bull; Chek ID: {selectedReceipt.receipt_id || selectedReceipt.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 py-3 text-[11px]">
                <div>
                  <span className="text-slate-400">Skanerlagan: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedReceipt.user_full_name || selectedReceipt.user_email}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Sana: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatDate(selectedReceipt.receipt_date || selectedReceipt.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Items Table */}
            <div className="mt-4">
              <div className="flex items-center justify-between pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Xarid qilingan tovar va xizmatlar ({selectedReceipt.items?.length || selectedReceipt.item_count} ta)
                </h4>
                {selectedReceipt.fiscal_sign && (
                  <a
                    href={`https://ofd.soliq.uz/check?t=${selectedReceipt.fiscal_sign}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Soliq OFD Portalida tekshirish
                  </a>
                )}
              </div>

              {modalLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Tovar nomi</th>
                        <th className="px-3 py-2">MXIK kodi</th>
                        <th className="px-3 py-2 text-right">Miqdor</th>
                        <th className="px-3 py-2 text-right">Narxi</th>
                        <th className="px-3 py-2 text-right">Jami</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedReceipt.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                            {item.name}
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-slate-400">
                            {item.catalog_code || '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">
                            {item.amount}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">
                            {formatCurrency(item.total_cost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  Ushbu chek bo'yicha tovar pozitsiyalari topilmadi
                </div>
              )}
            </div>

            {/* Total Footer */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  To'lov usuli: <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{selectedReceipt.payment_type || 'Nomaʼlum'}</span>
                </span>
                <div className="text-[10px] text-slate-400">
                  Fiskal belgi (ФП): {selectedReceipt.fiscal_sign || '—'}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400">Jami hisoblangan:</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedReceipt.total_sum)}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default ReceiptsPage
