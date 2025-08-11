import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { comparisonEngine } from '@/lib/comparison-engine'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      preferences, 
      user_history,
      recommendation_type = 'personalized',
      limit = 10 
    } = body

    let recommendations = []

    switch (recommendation_type) {
      case 'personalized':
        if (!preferences) {
          return NextResponse.json(
            { error: 'preferences are required for personalized recommendations' },
            { status: 400 }
          )
        }

        // Get user's tool interaction history
        const { data: userReviews } = await supabase
          .from('reviews')
          .select(`
            rating,
            tool:tools(name, category_id)
          `)
          .eq('user_id', user.id)

        const userHistoryData = {
          viewed_tools: user_history?.viewed_tools || [],
          rated_tools: userReviews?.map(r => ({
            tool_name: r.tool?.name || '',
            rating: r.rating
          })) || []
        }

        const aiRecommendations = await aiService.generatePersonalizedRecommendations(
          preferences,
          userHistoryData
        )

        // Get actual tools from database that match AI recommendations
        const { data: matchingTools } = await supabase
          .from('tools')
          .select(`
            *,
            category:categories(name, color_theme),
            scores:tool_scores(overall_score)
          `)
          .in('name', aiRecommendations)
          .limit(limit)

        recommendations = matchingTools || []
        break

      case 'similar':
        const { tool_id } = body
        if (!tool_id) {
          return NextResponse.json(
            { error: 'tool_id is required for similar recommendations' },
            { status: 400 }
          )
        }

        recommendations = await comparisonEngine.findSimilarTools(tool_id, limit)
        break

      case 'trending':
        // Get trending tools based on recent activity
        const { data: trendingTools } = await supabase
          .from('tools')
          .select(`
            *,
            category:categories(name, color_theme),
            scores:tool_scores(overall_score),
            reviews_count:reviews(count)
          `)
          .order('created_at', { ascending: false })
          .limit(limit)

        recommendations = trendingTools || []
        break

      case 'top_rated':
        // Get highest rated tools
        const { data: topRatedTools } = await supabase
          .from('tools')
          .select(`
            *,
            category:categories(name, color_theme),
            scores:tool_scores(overall_score)
          `)
          .order('tool_scores(overall_score)', { ascending: false })
          .limit(limit)

        recommendations = topRatedTools || []
        break

      default:
        return NextResponse.json({ error: 'Invalid recommendation type' }, { status: 400 })
    }

    return NextResponse.json({ 
      recommendations,
      recommendation_type,
      total: recommendations.length
    })
  } catch (error) {
    console.error('AI recommendations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') || 'personalized'
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createClient()

    if (type === 'category_based') {
      const category = searchParams.get('category')
      if (!category) {
        return NextResponse.json({ error: 'category is required' }, { status: 400 })
      }

      const { data: categoryTools } = await supabase
        .from('tools')
        .select(`
          *,
          category:categories!inner(name, color_theme),
          scores:tool_scores(overall_score)
        `)
        .eq('categories.name', category)
        .order('tool_scores(overall_score)', { ascending: false })
        .limit(limit)

      return NextResponse.json({ 
        recommendations: categoryTools || [],
        recommendation_type: 'category_based',
        category
      })
    }

    if (type === 'new_tools') {
      // Get recently added tools
      const { data: newTools } = await supabase
        .from('tools')
        .select(`
          *,
          category:categories(name, color_theme),
          scores:tool_scores(overall_score)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      return NextResponse.json({ 
        recommendations: newTools || [],
        recommendation_type: 'new_tools'
      })
    }

    // Default: return general recommendations
    const { data: generalRecommendations } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(name, color_theme),
        scores:tool_scores(overall_score)
      `)
      .order('tool_scores(overall_score)', { ascending: false })
      .limit(limit)

    return NextResponse.json({ 
      recommendations: generalRecommendations || [],
      recommendation_type: 'general'
    })
  } catch (error) {
    console.error('AI recommendations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
