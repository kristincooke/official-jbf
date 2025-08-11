'use client'

import { useState } from 'react'
import { AlertTriangle, X, ExternalLink } from 'lucide-react'

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'

  if (!isDemo) return null

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Demo Mode - Supabase Not Configured
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                This is a demo version with mock data. To enable full functionality, configure your Supabase credentials.
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:no-underline inline-flex items-center"
                >
                  Get started with Supabase
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
