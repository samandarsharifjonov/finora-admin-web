import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | undefined | null): string {
  const num = typeof amount === 'number' ? amount : Number(amount)
  if (amount === undefined || amount === null || isNaN(num)) return "0 so'm"
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(num) + " so'm"
}

export function formatCompactCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "0"
  const num = typeof amount === 'number' ? amount : Number(amount)
  if (isNaN(num)) return "0"
  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + ' mlrd'
  }
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + ' mln'
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(0) + ' ming'
  }
  return formatCurrency(num)
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Mavjud emas'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
