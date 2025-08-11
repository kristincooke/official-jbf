import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatScore(score: number) {
  return Math.round(score * 10) / 10
}

export function getPricingBadgeColor(pricingModel: string | null) {
  switch (pricingModel) {
    case 'free':
    case 'open_source':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'freemium':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'paid':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export function getCategoryColor(colorTheme: string | null) {
  switch (colorTheme) {
    case 'purple':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'blue':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'green':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'orange':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'red':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'gray':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    case 'yellow':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'pink':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    case 'indigo':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    case 'teal':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}
