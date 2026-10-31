import React, { useState, useEffect, useRef } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react'

interface DateRangePickerProps {
  startDate: string // 'YYYY-MM-DD'
  endDate: string // 'YYYY-MM-DD'
  onChange: (start: string, end: string) => void
  placeholder?: string
}

const MONTH_NAMES_UZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
]

const WEEK_DAYS_UZ = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak']

function formatDateToYMD(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(ymd: string): string {
  if (!ymd) return ''
  const parts = ymd.split('-')
  if (parts.length !== 3) return ymd
  return `${parts[2]}.${parts[1]}.${parts[0]}`
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = "Sana bo'yicha filter",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calendar view navigation month & year
  const initialDate = startDate ? new Date(startDate) : new Date()
  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  // Selection state while interacting inside popover
  const [pendingStart, setPendingStart] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)

  // Close popover when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setPendingStart(null)
        setHoverDate(null)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Sync view month when opened
  const handleOpen = () => {
    if (!isOpen) {
      const base = startDate ? new Date(startDate) : new Date()
      setViewYear(base.getFullYear())
      setViewMonth(base.getMonth())
      setPendingStart(null)
      setHoverDate(null)
    }
    setIsOpen(!isOpen)
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  // Handle single click on a day
  const handleDayClick = (dateStr: string) => {
    if (!pendingStart) {
      // First click: start of range
      setPendingStart(dateStr)
    } else {
      // Second click:
      // If clicked the EXACT SAME date as pendingStart:
      // User clicked the date twice -> pick that single day!
      if (pendingStart === dateStr) {
        onChange(dateStr, dateStr)
        setPendingStart(null)
        setIsOpen(false)
      } else {
        // Range from pendingStart to dateStr
        if (pendingStart <= dateStr) {
          onChange(pendingStart, dateStr)
        } else {
          onChange(dateStr, pendingStart)
        }
        setPendingStart(null)
        setIsOpen(false)
      }
    }
  }

  // Handle double click on a day -> immediately select that single date
  const handleDayDoubleClick = (dateStr: string) => {
    onChange(dateStr, dateStr)
    setPendingStart(null)
    setIsOpen(false)
  }

  // Quick preset shortcuts
  const applyPreset = (type: 'today' | 'yesterday' | 'last7' | 'thisMonth') => {
    const today = new Date()
    const todayStr = formatDateToYMD(today)

    if (type === 'today') {
      onChange(todayStr, todayStr)
    } else if (type === 'yesterday') {
      const yest = new Date()
      yest.setDate(today.getDate() - 1)
      const yestStr = formatDateToYMD(yest)
      onChange(yestStr, yestStr)
    } else if (type === 'last7') {
      const past = new Date()
      past.setDate(today.getDate() - 6)
      onChange(formatDateToYMD(past), todayStr)
    } else if (type === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      onChange(formatDateToYMD(firstDay), todayStr)
    }
    setPendingStart(null)
    setIsOpen(false)
  }

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    onChange('', '')
    setPendingStart(null)
    setIsOpen(false)
  }

  // Build calendar matrix
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  // In JS, 0 is Sunday, 1 is Monday ... 6 is Saturday
  // We want Monday (0) to Sunday (6)
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = []

  // Preceding month trailing days
  const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear
    const ds = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ dateStr: ds, dayNum: d, isCurrentMonth: false })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({ dateStr: ds, dayNum: i, isCurrentMonth: true })
  }

  // Trailing next month days to fill rows of 7
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
    const ds = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({ dateStr: ds, dayNum: i, isCurrentMonth: false })
  }

  const todayStr = formatDateToYMD(new Date())
  const hasFilter = Boolean(startDate || endDate)

  // Determine current active range for highlighting
  const effectiveStart = pendingStart || startDate
  const effectiveEnd = pendingStart ? (hoverDate || pendingStart) : endDate
  const minActive = effectiveStart && effectiveEnd ? (effectiveStart <= effectiveEnd ? effectiveStart : effectiveEnd) : effectiveStart
  const maxActive = effectiveStart && effectiveEnd ? (effectiveStart <= effectiveEnd ? effectiveEnd : effectiveStart) : effectiveEnd

  // Format label for trigger button
  const getButtonLabel = () => {
    if (!startDate && !endDate) return placeholder
    if (startDate && endDate) {
      if (startDate === endDate) {
        return `${formatDisplayDate(startDate)} (1 kun)`
      }
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
    }
    if (startDate) return `${formatDisplayDate(startDate)} dan`
    if (endDate) return `${formatDisplayDate(endDate)} gacha`
    return placeholder
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleOpen}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
            hasFilter
              ? 'border-finora-500 bg-finora-50/70 text-finora-700 shadow-sm dark:border-finora-500/80 dark:bg-finora-950/40 dark:text-finora-300'
              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100/70 dark:border-dark-border dark:bg-dark-cardSecondary dark:text-slate-300 dark:hover:bg-slate-800/60'
          }`}
        >
          <CalendarIcon className={`h-3.5 w-3.5 ${hasFilter ? 'text-finora-600 dark:text-finora-400' : 'text-slate-400'}`} />
          <span className="truncate max-w-[170px] sm:max-w-none">{getButtonLabel()}</span>

          {hasFilter && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={e => e.key === 'Enter' && handleClear()}
              title="Filterni tozalash"
              className="ml-1 rounded-full p-0.5 hover:bg-finora-200/60 dark:hover:bg-finora-900/60 text-finora-700 dark:text-finora-300"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-88 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-dark-border dark:bg-dark-card animate-in fade-in zoom-in-95 duration-100">
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border/60">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {MONTH_NAMES_UZ[viewMonth]} {viewYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 py-2.5 border-b border-slate-100 dark:border-dark-border/60 text-[11px]">
            <button
              type="button"
              onClick={() => applyPreset('today')}
              className="rounded-lg border border-slate-200 px-2 py-1 font-medium text-slate-700 hover:border-finora-400 hover:bg-finora-50/50 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Bugun
            </button>
            <button
              type="button"
              onClick={() => applyPreset('yesterday')}
              className="rounded-lg border border-slate-200 px-2 py-1 font-medium text-slate-700 hover:border-finora-400 hover:bg-finora-50/50 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Kecha
            </button>
            <button
              type="button"
              onClick={() => applyPreset('last7')}
              className="rounded-lg border border-slate-200 px-2 py-1 font-medium text-slate-700 hover:border-finora-400 hover:bg-finora-50/50 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
            >
              7 kun
            </button>
            <button
              type="button"
              onClick={() => applyPreset('thisMonth')}
              className="rounded-lg border border-slate-200 px-2 py-1 font-medium text-slate-700 hover:border-finora-400 hover:bg-finora-50/50 dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Shu oy
            </button>
            {hasFilter && (
              <button
                type="button"
                onClick={() => handleClear()}
                className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <RotateCcw className="h-3 w-3" /> Tozalash
              </button>
            )}
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 pt-2 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
            {WEEK_DAYS_UZ.map(d => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5 text-xs">
            {days.map(d => {
              const isSelectedStart = minActive === d.dateStr
              const isSelectedEnd = maxActive === d.dateStr
              const isInRange = minActive && maxActive && d.dateStr > minActive && d.dateStr < maxActive
              const isSingleDay = minActive && maxActive && minActive === maxActive && isSelectedStart
              const isToday = d.dateStr === todayStr

              let dayClasses = 'relative h-8 w-full flex items-center justify-center rounded-lg text-[11px] font-medium transition-colors select-none '

              if (!d.isCurrentMonth) {
                dayClasses += 'text-slate-300 dark:text-slate-600 '
              } else {
                dayClasses += 'text-slate-700 dark:text-slate-200 '
              }

              if (isSingleDay) {
                dayClasses += 'bg-finora-600 text-white font-bold shadow-sm shadow-finora-500/30 dark:bg-finora-500 '
              } else if (isSelectedStart) {
                dayClasses += 'bg-finora-600 text-white font-bold rounded-r-none '
              } else if (isSelectedEnd) {
                dayClasses += 'bg-finora-600 text-white font-bold rounded-l-none '
              } else if (isInRange) {
                dayClasses += 'bg-finora-100 text-finora-900 rounded-none dark:bg-finora-950/60 dark:text-finora-200 '
              } else {
                dayClasses += 'hover:bg-slate-100 dark:hover:bg-slate-800 '
              }

              if (isToday && !isSelectedStart && !isSelectedEnd && !isInRange) {
                dayClasses += 'ring-1 ring-finora-500 ring-inset font-bold text-finora-600 dark:text-finora-400 '
              }

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => handleDayClick(d.dateStr)}
                  onDoubleClick={() => handleDayDoubleClick(d.dateStr)}
                  onMouseEnter={() => pendingStart && setHoverDate(d.dateStr)}
                  className={dayClasses}
                  title={`${d.dateStr} (Sanani ikki marta bossangiz, shu kun tanlanadi)`}
                >
                  {d.dayNum}
                </button>
              )
            })}
          </div>

          {/* Bottom guidance tip */}
          <div className="mt-3 rounded-xl bg-slate-50 p-2 text-[10px] text-slate-500 dark:bg-dark-cardSecondary dark:text-slate-400">
            <span className="font-bold text-finora-600 dark:text-finora-400">Maslahat:</span> Sanani{' '}
            <strong className="text-slate-700 dark:text-slate-200">2 marta ketma-ket</strong> yoki{' '}
            <strong className="text-slate-700 dark:text-slate-200">double-click</strong> qilsangiz, aynan o'sha kun tanlanadi.
          </div>
        </div>
      )}
    </div>
  )
}
