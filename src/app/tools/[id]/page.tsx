import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ReviewForm from '@/components/review-form'
import { AIToolEnhancer } from '@/components/ai-tool-enhancer'
import { SmartRecommendations } from '@/components/smart-recommendations'
import { SentimentAnalysis } from '@/components/sentiment-analysis'
import { ExternalLink, Github, Star, Users, Calendar, BarChart3 } from 'lucide-react'

interface ToolDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch tool details with related data
  const { data: tool, error } = await supabase
    .from('tools')
    .select(`
      *,
      category:categories(name, color_theme),
      scores:tool_scores(
        overall_score,
        accessibility_score,
        performance_score,
        innovation_score,
        enterprise_score
      ),
      reviews(
        id,
        rating,
        review_text,
        pros,
        cons,
        created_at,
        user_id
      )
    `)
    .eq('id', id)
    .single()

  if (error || !tool) {
    notFound()
  }

  // Calculate average rating
  const avgRating = tool.reviews?.length > 0 
    ? tool.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / tool.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Tool Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {tool.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: `${tool.category?.color_theme}20`,
                    color: tool.category?.color_theme 
                  }}
                >
                  {tool.category?.name}
                </Badge>
                {tool.scores && (
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      Score: {(tool.scores.overall_score * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {avgRating.toFixed(1)} ({tool.reviews?.length} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {tool.website_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {tool.github_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={tool.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            {tool.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Tool Enhancer */}
            <AIToolEnhancer
              toolId={tool.id}
              toolName={tool.name}
              currentDescription={tool.description}
              category={tool.category?.name}
            />

            {/* Tool Scores */}
            {tool.scores && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {(tool.scores.accessibility_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Accessibility
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {(tool.scores.performance_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Performance
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        {(tool.scores.innovation_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Innovation
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {(tool.scores.enterprise_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Enterprise
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewForm toolId={tool.id} />
                
                {tool.reviews && tool.reviews.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Recent Reviews
                    </h3>
                    {tool.reviews.slice(0, 5).map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-gray-700 dark:text-gray-300 mb-2">
                            {review.review_text}
                          </p>
                        )}
                        {review.pros && (
                          <div className="text-sm">
                            <span className="font-medium text-green-600">Pros:</span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {review.pros}
                            </span>
                          </div>
                        )}
                        {review.cons && (
                          <div className="text-sm">
                            <span className="font-medium text-red-600">Cons:</span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              {review.cons}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Sentiment Analysis */}
            <SentimentAnalysis toolId={tool.id} />

            {/* Smart Recommendations */}
            <SmartRecommendations 
              currentToolId={tool.id}
              userPreferences={{
                categories: [tool.category?.name || 'Web Development'],
                experience_level: 'intermediate',
                use_cases: ['development', 'productivity']
              }}
            />

            {/* Tool Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Tool Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Reviews</span>
                  </div>
                  <span className="font-medium">{tool.reviews?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Added</span>
                  </div>
                  <span className="font-medium">
                    {new Date(tool.created_at).toLocaleDateString()}
                  </span>
                </div>
                {avgRating > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Average Rating</span>
                    </div>
                    <span className="font-medium">{avgRating.toFixed(1)}/5</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
