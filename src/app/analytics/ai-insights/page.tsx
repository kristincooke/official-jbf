'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Sparkles,
  Target,
  Users,
  MessageSquare,
  RefreshCw,
  Calendar,
  Award,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface AIInsightsData {
  categoryTrends: Array<{
    category: string
    color_theme: string
    total_tools: number
    recent_additions: number
    total_reviews: number
    avg_score: number
    trend_score: number
  }>
  hotTools: Array<{
    id: string
    name: string
    description: string
    category: { name: string; color_theme: string }
    hot_score: number
    days_since_created: number
    review_count: number
    avg_rating: number
  }>
  sentimentInsights: {
    overall_sentiment: number
    positive_percentage: number
    negative_percentage: number
    neutral_percentage: number
    trending_emotions: string[]
  }
  aiRecommendations: {
    emerging_categories: string[]
    predicted_trends: string[]
    content_gaps: string[]
  }
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<AIInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAIInsights = async () => {
    setRefreshing(true)
    try {
      // Fetch trending categories
      const trendsResponse = await fetch('/api/ai/trends?type=trending_categories')
      const trendsData = await trendsResponse.json()

      // Fetch hot tools
      const hotToolsResponse = await fetch('/api/ai/trends?type=hot_tools')
      const hotToolsData = await hotToolsResponse.json()

      // Mock sentiment insights (would be calculated from actual review data)
      const sentimentInsights = {
        overall_sentiment: 0.72,
        positive_percentage: 65,
        negative_percentage: 15,
        neutral_percentage: 20,
        trending_emotions: ['excited', 'satisfied', 'impressed', 'helpful', 'innovative']
      }

      // Mock AI recommendations (would come from AI analysis)
      const aiRecommendations = {
        emerging_categories: ['AI Tools', 'Web3 Development', 'Low-Code Platforms'],
        predicted_trends: ['AI-powered development tools', 'Real-time collaboration', 'Serverless architecture'],
        content_gaps: ['Mobile development tools', 'DevOps automation', 'Testing frameworks']
      }

      setInsights({
        categoryTrends: trendsData.trending_categories || [],
        hotTools: hotToolsData.hot_tools || [],
        sentimentInsights,
        aiRecommendations
      })
    } catch (error) {
      console.error('Failed to fetch AI insights:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAIInsights()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Analyzing data with AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-8 w-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AI Insights
                </h1>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Deep insights and predictions powered by artificial intelligence
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchAIInsights}
                disabled={refreshing}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* AI Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(insights?.sentimentInsights.overall_sentiment * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Community satisfaction score
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {insights?.sentimentInsights.positive_percentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                Positive sentiment detected
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Tools</CardTitle>
              <Zap className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {insights?.hotTools.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Trending this week
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emerging Categories</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {insights?.aiRecommendations.emerging_categories.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                AI-predicted growth areas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Category Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights?.categoryTrends.slice(0, 6).map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color_theme }}
                      />
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {category.total_tools} tools • {category.total_reviews} reviews
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        +{category.recent_additions} this week
                      </div>
                      <div className="text-xs text-gray-500">
                        Trend Score: {category.trend_score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hot Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Hot Tools This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights?.hotTools.slice(0, 6).map((tool, index) => (
                  <div key={tool.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{tool.name}</div>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {tool.category.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tool.review_count} reviews • {tool.avg_rating.toFixed(1)} avg rating
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-600">
                        🔥 {tool.hot_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tool.days_since_created}d old
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Emerging Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insights?.aiRecommendations.emerging_categories.map((category) => (
                    <Badge key={category} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Predicted Trends
                </h4>
                <div className="space-y-2">
                  {insights?.aiRecommendations.predicted_trends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      {trend}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment & Emotions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Sentiment Distribution
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Positive</span>
                    <span className="text-sm font-medium text-green-600">
                      {insights?.sentimentInsights.positive_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${insights?.sentimentInsights.positive_percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Neutral</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {insights?.sentimentInsights.neutral_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${insights?.sentimentInsights.neutral_percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Negative</span>
                    <span className="text-sm font-medium text-red-600">
                      {insights?.sentimentInsights.negative_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${insights?.sentimentInsights.negative_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Trending Emotions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insights?.sentimentInsights.trending_emotions.map((emotion) => (
                    <Badge key={emotion} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
