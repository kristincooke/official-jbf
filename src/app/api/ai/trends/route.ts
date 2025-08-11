import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated (optional for trend analysis)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { 
      analysis_type = 'category_trends',
      time_period = '30d',
      category_filter,
      limit = 10
    } = body

    let trendData: any[] = []

    switch (analysis_type) {
      case 'category_trends':
        // Analyze trends by category
        const { data: categoryData } = await supabase
          .from('tools')
          .select(`
            category_id,
            created_at,
            category:categories(name),
            reviews(rating, created_at),
            scores:tool_scores(overall_score)
          `)
          .gte('created_at', new Date(Date.now() - (parseInt(time_period) * 24 * 60 * 60 * 1000)).toISOString())

        if (categoryData) {
          const categoryStats = categoryData.reduce((acc: any, tool: any) => {
            const categoryName = tool.category?.name || 'Uncategorized'
            if (!acc[categoryName]) {
              acc[categoryName] = {
                name: categoryName,
                tool_count: 0,
                avg_score: 0,
                total_reviews: 0,
                avg_rating: 0,
                recent_additions: 0
              }
            }
            
            acc[categoryName].tool_count++
            acc[categoryName].avg_score += tool.scores?.overall_score || 0
            acc[categoryName].total_reviews += tool.reviews?.length || 0
            
            if (tool.reviews && tool.reviews.length > 0) {
              const avgRating = tool.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / tool.reviews.length
              acc[categoryName].avg_rating += avgRating
            }

            // Count recent additions (last 7 days)
            const weekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
            if (new Date(tool.created_at) > weekAgo) {
              acc[categoryName].recent_additions++
            }

            return acc
          }, {})

          // Calculate averages and prepare for AI analysis
          Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category]
            stats.avg_score = stats.avg_score / stats.tool_count
            stats.avg_rating = stats.avg_rating / stats.tool_count
          })

          trendData = Object.values(categoryStats)
        }
        break

      case 'tool_trends':
        // Analyze individual tool trends
        const { data: toolData } = await supabase
          .from('tools')
          .select(`
            id,
            name,
            created_at,
            category:categories(name),
            reviews(rating, created_at),
            scores:tool_scores(overall_score)
          `)
          .order('created_at', { ascending: false })
          .limit(limit)

        trendData = toolData || []
        break

      case 'emerging_tools':
        // Find tools with rapid growth in reviews/ratings
        const { data: emergingData } = await supabase
          .from('tools')
          .select(`
            id,
            name,
            created_at,
            category:categories(name),
            reviews(rating, created_at),
            scores:tool_scores(overall_score)
          `)
          .gte('created_at', new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString())

        trendData = emergingData || []
        break

      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }

    // Use AI to analyze trends
    const trendAnalysis = await aiService.analyzeTrends(trendData)

    return NextResponse.json({
      analysis_type,
      time_period,
      trends: trendAnalysis,
      data_points: trendData.length,
      generated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI trends API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'category_trends'
    const period = searchParams.get('period') || '30d'

    const supabase = await createClient()

    // Get trending categories based on recent activity
    if (type === 'trending_categories') {
      const { data: trendingCategories } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          color_theme,
          tools(
            id,
            created_at,
            reviews(rating, created_at),
            scores:tool_scores(overall_score)
          )
        `)

      const categoryTrends = trendingCategories?.map(category => {
        const recentTools = category.tools.filter((tool: any) => {
          const weekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
          return new Date(tool.created_at) > weekAgo
        })

        const totalReviews = category.tools.reduce((sum: number, tool: any) => 
          sum + (tool.reviews?.length || 0), 0
        )

        const avgScore = category.tools.reduce((sum: number, tool: any) => 
          sum + (tool.scores?.overall_score || 0), 0
        ) / (category.tools.length || 1)

        return {
          category: category.name,
          color_theme: category.color_theme,
          total_tools: category.tools.length,
          recent_additions: recentTools.length,
          total_reviews: totalReviews,
          avg_score: avgScore,
          trend_score: (recentTools.length * 0.4) + (totalReviews * 0.3) + (avgScore * 0.3)
        }
      }).sort((a, b) => b.trend_score - a.trend_score) || []

      return NextResponse.json({
        trending_categories: categoryTrends,
        analysis_type: 'trending_categories'
      })
    }

    // Get hot tools (recently added with high engagement)
    if (type === 'hot_tools') {
      const { data: hotTools } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          description,
          created_at,
          category:categories(name, color_theme),
          reviews(rating, created_at),
          scores:tool_scores(overall_score)
        `)
        .gte('created_at', new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)).toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      const hotToolsWithScore = hotTools?.map(tool => {
        const reviewCount = tool.reviews?.length || 0
        const avgRating = reviewCount > 0 
          ? tool.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
          : 0
        const daysSinceCreated = Math.max(1, Math.floor((Date.now() - new Date(tool.created_at).getTime()) / (24 * 60 * 60 * 1000)))
        
        const hotScore = (reviewCount / daysSinceCreated) * avgRating * ((tool as any).scores?.overall_score || 0.5)

        return {
          ...tool,
          hot_score: hotScore,
          days_since_created: daysSinceCreated,
          review_count: reviewCount,
          avg_rating: avgRating
        }
      }).sort((a, b) => b.hot_score - a.hot_score) || []

      return NextResponse.json({
        hot_tools: hotToolsWithScore,
        analysis_type: 'hot_tools'
      })
    }

    return NextResponse.json({ error: 'Invalid trend type' }, { status: 400 })
  } catch (error) {
    console.error('AI trends API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
