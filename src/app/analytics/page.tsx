import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Star, 
  Brain, 
  Activity,
  Calendar,
  Target,
  Zap,
  Eye,
  MessageSquare,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalTools: number
  totalUsers: number
  totalReviews: number
  avgRating: number
  topCategories: Array<{
    name: string
    count: number
    color_theme: string
  }>
  recentActivity: Array<{
    type: 'tool_added' | 'review_added' | 'user_joined'
    data: any
    created_at: string
  }>
  trendingTools: Array<{
    id: string
    name: string
    category: string
    score: number
    reviews_count: number
  }>
}

async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = await createClient()

  // Get total counts
  const [
    { count: totalTools },
    { count: totalUsers },
    { count: totalReviews }
  ] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true })
  ])

  // Get average rating
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('rating')

  const avgRating = reviewsData && reviewsData.length > 0
    ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
    : 0

  // Get top categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select(`
      name,
      color_theme,
      tools(count)
    `)

  const topCategories = categoriesData?.map(cat => ({
    name: cat.name,
    count: cat.tools?.length || 0,
    color_theme: cat.color_theme || '#6366f1'
  })).sort((a, b) => b.count - a.count).slice(0, 5) || []

  // Get recent activity (simplified)
  const { data: recentTools } = await supabase
    .from('tools')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentReviews } = await supabase
    .from('reviews')
    .select('id, rating, created_at, tool:tools(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentActivity = [
    ...(recentTools?.map(tool => ({
      type: 'tool_added' as const,
      data: tool,
      created_at: tool.created_at
    })) || []),
    ...(recentReviews?.map(review => ({
      type: 'review_added' as const,
      data: review,
      created_at: review.created_at
    })) || [])
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)

  // Get trending tools (simplified)
  const { data: trendingData } = await supabase
    .from('tools')
    .select(`
      id,
      name,
      category:categories(name),
      scores:tool_scores(overall_score),
      reviews(count)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  const trendingTools = trendingData?.map(tool => ({
    id: tool.id,
    name: tool.name,
    category: (tool.category as any)?.name || 'Uncategorized',
    score: (tool.scores as any)?.overall_score || 0,
    reviews_count: (tool.reviews as any)?.length || 0
  })).sort((a, b) => (b.score * 0.7 + b.reviews_count * 0.3) - (a.score * 0.7 + a.reviews_count * 0.3)) || []

  return {
    totalTools: totalTools || 0,
    totalUsers: totalUsers || 0,
    totalReviews: totalReviews || 0,
    avgRating,
    topCategories,
    recentActivity,
    trendingTools
  }
}

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsData()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive insights into the JuiceBox Factory ecosystem
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Button asChild>
                <Link href="/analytics/ai-insights">
                  <Zap className="h-4 w-4 mr-2" />
                  AI Insights
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.totalTools}</div>
              <p className="text-xs text-muted-foreground">
                Developer tools in database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered community members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analytics.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                Community reviews submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.avgRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Average tool rating
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color_theme }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.count} tools
                      </span>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.trendingTools.slice(0, 5).map((tool, index) => (
                  <div key={tool.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tool.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {(tool.score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {tool.reviews_count} reviews
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'tool_added' && (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'review_added' && (
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    {activity.type === 'user_joined' && (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {activity.type === 'tool_added' && `New tool: ${activity.data.name}`}
                      {activity.type === 'review_added' && `Review for ${activity.data.tool?.name || 'a tool'}`}
                      {activity.type === 'user_joined' && 'New user joined'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {activity.type === 'review_added' && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < activity.data.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
