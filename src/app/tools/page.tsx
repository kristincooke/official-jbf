'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List } from 'lucide-react'
import ToolCard from '@/components/tool-card'
import { cn, getCategoryColor } from '@/lib/utils'

interface Tool {
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

interface Category {
  id: string
  name: string
  color_theme: string | null
}

// Mock data for demonstration - will be replaced with actual Supabase data
const mockTools: Tool[] = [
  {
    id: '1',
    name: 'Rive',
    description: 'Create and ship beautiful animations to any platform. Design interactive animations that run anywhere.',
    website_url: 'https://rive.app',
    github_url: null,
    pricing_model: 'freemium',
    free_tier: true,
    logo_url: null,
    category: { name: 'Animation & Graphics', color_theme: 'purple' },
    scores: { overall_score: 4.8 },
    _count: { reviews: 24 }
  },
  {
    id: '2',
    name: 'Builder.io',
    description: 'Drag and drop page builder and CMS that integrates with your existing site and codebase.',
    website_url: 'https://builder.io',
    github_url: 'https://github.com/BuilderIO/builder',
    pricing_model: 'freemium',
    free_tier: true,
    logo_url: null,
    category: { name: 'No-Code/Low-Code', color_theme: 'green' },
    scores: { overall_score: 4.6 },
    _count: { reviews: 18 }
  },
  {
    id: '3',
    name: 'Framer',
    description: 'Design and publish stunning sites that scale with your business. No code required.',
    website_url: 'https://framer.com',
    github_url: null,
    pricing_model: 'freemium',
    free_tier: true,
    logo_url: null,
    category: { name: 'Design & Prototyping', color_theme: 'indigo' },
    scores: { overall_score: 4.7 },
    _count: { reviews: 32 }
  },
  {
    id: '4',
    name: 'Supabase',
    description: 'The open source Firebase alternative. Build a backend in less than 2 minutes.',
    website_url: 'https://supabase.com',
    github_url: 'https://github.com/supabase/supabase',
    pricing_model: 'freemium',
    free_tier: true,
    logo_url: null,
    category: { name: 'Database & Storage', color_theme: 'yellow' },
    scores: { overall_score: 4.9 },
    _count: { reviews: 45 }
  }
]

const mockCategories: Category[] = [
  { id: '1', name: 'Animation & Graphics', color_theme: 'purple' },
  { id: '2', name: 'AI & Machine Learning', color_theme: 'blue' },
  { id: '3', name: 'No-Code/Low-Code', color_theme: 'green' },
  { id: '4', name: 'Web Development', color_theme: 'orange' },
  { id: '5', name: 'Mobile Development', color_theme: 'red' },
  { id: '6', name: 'DevOps & Infrastructure', color_theme: 'gray' },
  { id: '7', name: 'Database & Storage', color_theme: 'yellow' },
  { id: '8', name: 'Testing & QA', color_theme: 'pink' },
  { id: '9', name: 'Design & Prototyping', color_theme: 'indigo' },
  { id: '10', name: 'Analytics & Monitoring', color_theme: 'teal' }
]

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(mockTools)
  const [filteredTools, setFilteredTools] = useState<Tool[]>(mockTools)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedPricing, setSelectedPricing] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter tools based on search and filters
  useEffect(() => {
    let filtered = tools

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(tool => tool.category?.name === selectedCategory)
    }

    // Pricing filter
    if (selectedPricing) {
      if (selectedPricing === 'free_tier') {
        filtered = filtered.filter(tool => tool.free_tier)
      } else {
        filtered = filtered.filter(tool => tool.pricing_model === selectedPricing)
      }
    }

    setFilteredTools(filtered)
  }, [tools, searchQuery, selectedCategory, selectedPricing])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedPricing('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Developer Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover and compare the best tools for your development workflow
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Categories</option>
                {mockCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Pricing</option>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
                <option value="open_source">Open Source</option>
                <option value="free_tier">Has Free Tier</option>
              </select>

              {(searchQuery || selectedCategory || selectedPricing) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-l-lg transition-colors',
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-r-lg transition-colors',
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Tools Grid/List */}
        {filteredTools.length > 0 ? (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}>
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tools found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
