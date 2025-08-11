import Link from 'next/link'
import { ExternalLink, Github, Star } from 'lucide-react'
import { cn, formatScore, getPricingBadgeColor, getCategoryColor } from '@/lib/utils'

interface ToolCardProps {
  tool: {
    id: string
    name: string
    description: string
    website_url: string | null
    github_url: string | null
    pricing_model: string | null
    free_tier: boolean
    logo_url: string | null
    category?: {
      name: string
      color_theme: string | null
    } | null
    scores?: {
      overall_score: number
    } | null
    _count?: {
      reviews: number
    }
  }
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {tool.logo_url ? (
            <img
              src={tool.logo_url}
              alt={`${tool.name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {tool.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {tool.name}
            </h3>
            {tool.category && (
              <span
                className={cn(
                  'inline-block px-2 py-1 text-xs font-medium rounded-full',
                  getCategoryColor(tool.category.color_theme)
                )}
              >
                {tool.category.name}
              </span>
            )}
          </div>
        </div>
        
        {tool.scores && (
          <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              {formatScore(tool.scores.overall_score)}
            </span>
          </div>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
        {tool.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {tool.pricing_model && (
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                getPricingBadgeColor(tool.pricing_model)
              )}
            >
              {tool.pricing_model === 'open_source' ? 'Open Source' : 
               tool.pricing_model.charAt(0).toUpperCase() + tool.pricing_model.slice(1)}
            </span>
          )}
          {tool.free_tier && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Free Tier
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {tool.github_url && (
            <a
              href={tool.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {tool.website_url && (
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Link
            href={`/tools/${tool.id}`}
            className="px-3 py-1 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {tool._count?.reviews && tool._count.reviews > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tool._count.reviews} review{tool._count.reviews !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
