import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatNumber(num: number) {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr'
  if (num >= 100000) return (num / 100000).toFixed(1) + 'L'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
