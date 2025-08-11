'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Heart, Frown, Meh, Smile, BarChart3, TrendingUp } from 'lucide-react'

interface SentimentData {
  tool_sentiment: {
    average_score: number
    distribution: {
      positive: number
      neutral: number
      negative: number
    }
    common_emotions: Record<string, number>
    total_reviews: number
  }
  individual_analysis: Array<{
    review_id: string
    rating: number
    sentiment: {
      sentiment: 'positive' | 'neutral' | 'negative'
      score: number
      emotions: string[]
    }
  }>
}

interface SentimentAnalysisProps {
  toolId: string
  className?: string
}

export function SentimentAnalysis({ toolId, className = '' }: SentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSentimentAnalysis()
  }, [toolId])

  const fetchSentimentAnalysis = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/ai/sentiment?tool_id=${toolId}`)
      
      if (response.ok) {
        const data = await response.json()
        setSentimentData(data)
      } else {
        setError('Failed to fetch sentiment analysis')
      }
    } catch (err) {
      setError('Error loading sentiment analysis')
      console.error('Sentiment analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500'
      case 'negative':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.6) return 'text-green-600 dark:text-green-400'
    if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getTopEmotions = (emotions: Record<string, number>) => {
    return Object.entries(emotions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !sentimentData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {error || 'No sentiment data available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const { tool_sentiment } = sentimentData
  const totalReviews = tool_sentiment.total_reviews
  const avgScore = tool_sentiment.average_score
  const distribution = tool_sentiment.distribution

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sentiment Analysis
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            AI-Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Sentiment Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overall Sentiment Score
            </span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
            {(avgScore * 100).toFixed(1)}%
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Sentiment Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            Sentiment Distribution
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4 text-green-500" />
                <span className="text-sm">Positive</span>
              </div>
              <span className="text-sm font-medium">
                {distribution.positive} ({((distribution.positive / totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={(distribution.positive / totalReviews) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Meh className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Neutral</span>
              </div>
              <span className="text-sm font-medium">
                {distribution.neutral} ({((distribution.neutral / totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={(distribution.neutral / totalReviews) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Frown className="h-4 w-4 text-red-500" />
                <span className="text-sm">Negative</span>
              </div>
              <span className="text-sm font-medium">
                {distribution.negative} ({((distribution.negative / totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={(distribution.negative / totalReviews) * 100} 
              className="h-2"
            />
          </div>
        </div>

        {/* Common Emotions */}
        {Object.keys(tool_sentiment.common_emotions).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">
              Common Emotions
            </h4>
            <div className="flex flex-wrap gap-2">
              {getTopEmotions(tool_sentiment.common_emotions).map(([emotion, count]) => (
                <Badge 
                  key={emotion} 
                  variant="secondary"
                  className="text-xs"
                >
                  {emotion} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews Sentiment */}
        {sentimentData.individual_analysis.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">
              Recent Reviews
            </h4>
            <div className="space-y-2">
              {sentimentData.individual_analysis.slice(0, 5).map((analysis) => (
                <div 
                  key={analysis.review_id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(analysis.sentiment.sentiment)}
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Heart
                          key={i}
                          className={`h-3 w-3 ${
                            i < analysis.rating
                              ? 'text-red-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getScoreColor(analysis.sentiment.score)}`}>
                      {(analysis.sentiment.score * 100).toFixed(0)}%
                    </span>
                    <Badge 
                      variant="outline" 
                      className="text-xs capitalize"
                    >
                      {analysis.sentiment.sentiment}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
