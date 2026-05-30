import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `BB-${year}${random}`
}

export function calculateDiscount(marketPrice: number, sellingPrice: number) {
  const saved = marketPrice - sellingPrice
  const percent = Math.round((saved / marketPrice) * 100)
  return { saved, percent }
}

export function getConditionLabel(score: number): string {
  if (score >= 9) return 'Like New'
  if (score >= 7) return 'Good'
  if (score >= 5) return 'Acceptable'
  return 'Old'
}

export function getConditionColor(score: number): string {
  if (score >= 9) return 'text-emerald-400'
  if (score >= 7) return 'text-blue-400'
  if (score >= 5) return 'text-amber-400'
  return 'text-red-400'
}
