'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ToolCard from '@/components/tool-card'
import { Brain, TrendingUp, Star, Clock, Filter } from 'lucide-react'

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

interface SmartRecommendationsProps {
  userId?: string
  currentToolId?: string
  userPreferences?: {
    categories: string[]
    experience_level: string
    use_cases: string[]
  }
  className?: string
}

export function SmartRecommendations({
  userId,
  currentToolId,
  userPreferences,
  className = ''
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)
  const [recommendationType, setRecommendationType] = useState<
    'personalized' | 'similar' | 'trending' | 'top_rated'
  >('personalized')

  const fetchRecommendations = async (type: typeof recommendationType) => {
    setLoading(true)
    try {
      let url = '/api/ai/recommendations'
      let body: any = {
        recommendation_type: type,
        limit: 6
      }

      if (type === 'personalized' && userPreferences) {
        body.preferences = userPreferences
      }

      if (type === 'similar' && currentToolId) {
        body.tool_id = currentToolId
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      // Fallback to general recommendations
      fetchGeneralRecommendations()
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneralRecommendations = async () => {
    try {
      const response = await fetch('/api/ai/recommendations?type=general&limit=6')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to fetch general recommendations:', error)
    }
  }

  useEffect(() => {
    fetchRecommendations(recommendationType)
  }, [recommendationType, currentToolId])

  const getRecommendationIcon = (type: typeof recommendationType) => {
    switch (type) {
      case 'personalized':
        return <Brain className="h-4 w-4" />
      case 'similar':
        return <Filter className="h-4 w-4" />
      case 'trending':
        return <TrendingUp className="h-4 w-4" />
      case 'top_rated':
        return <Star className="h-4 w-4" />
    }
  }

  const getRecommendationTitle = (type: typeof recommendationType) => {
    switch (type) {
      case 'personalized':
        return 'AI-Powered Recommendations'
      case 'similar':
        return 'Similar Tools'
      case 'trending':
        return 'Trending Now'
      case 'top_rated':
        return 'Top Rated Tools'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getRecommendationIcon(recommendationType)}
            {getRecommendationTitle(recommendationType)}
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            AI-Powered
          </Badge>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={recommendationType === 'personalized' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecommendationType('personalized')}
            disabled={loading}
          >
            <Brain className="h-3 w-3 mr-1" />
            For You
          </Button>
          
          {currentToolId && (
            <Button
              variant={recommendationType === 'similar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRecommendationType('similar')}
              disabled={loading}
            >
              <Filter className="h-3 w-3 mr-1" />
              Similar
            </Button>
          )}
          
          <Button
            variant={recommendationType === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecommendationType('trending')}
            disabled={loading}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Button>
          
          <Button
            variant={recommendationType === 'top_rated' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecommendationType('top_rated')}
            disabled={loading}
          >
            <Star className="h-3 w-3 mr-1" />
            Top Rated
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((tool) => (
              <div key={tool.id} className="relative">
                <ToolCard tool={tool} />
                {recommendationType === 'personalized' && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs"
                  >
                    AI Match
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No recommendations available at the moment.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRecommendations(recommendationType)}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => fetchRecommendations(recommendationType)}
              disabled={loading}
            >
              <Clock className="h-4 w-4 mr-2" />
              Refresh Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
