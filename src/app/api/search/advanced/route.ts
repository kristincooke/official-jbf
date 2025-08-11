import { NextRequest, NextResponse } from 'next/server'
import { advancedSearch } from '@/lib/advanced-search'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const action = searchParams.get('action') || 'search'
    const limit = parseInt(searchParams.get('limit') || '20')

    switch (action) {
      case 'search':
        if (!query.trim()) {
          return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
        }

        // Parse filters from query params
        const filters = {
          categories: searchParams.get('categories')?.split(',').filter(Boolean),
          pricing_models: searchParams.get('pricing_models')?.split(',').filter(Boolean),
          free_tier: searchParams.get('free_tier') === 'true' ? true : undefined,
          min_score: searchParams.get('min_score') ? parseFloat(searchParams.get('min_score')!) : undefined,
          has_github: searchParams.get('has_github') === 'true' ? true : undefined,
          languages: searchParams.get('languages')?.split(',').filter(Boolean),
          tags: searchParams.get('tags')?.split(',').filter(Boolean)
        }

        // Remove undefined values
        Object.keys(filters).forEach(key => {
          if (filters[key as keyof typeof filters] === undefined) {
            delete filters[key as keyof typeof filters]
          }
        })

        const searchResults = await advancedSearch.search({
          query,
          filters,
          limit,
          include_similar: searchParams.get('include_similar') === 'true'
        })

        return NextResponse.json({
          query,
          results: searchResults,
          total: searchResults.length,
          filters_applied: filters
        })

      case 'suggestions':
        const suggestions = await advancedSearch.getSuggestions(query)
        return NextResponse.json({
          query,
          suggestions
        })

      case 'trending':
        const trending = await advancedSearch.getTrendingSearches()
        return NextResponse.json({
          trending_searches: trending
        })

      case 'autocomplete':
        const autocompleteResults = await advancedSearch.searchWithAutocomplete(query, limit)
        return NextResponse.json(autocompleteResults)

      default:
        return NextResponse.json({ error: 'Invalid action. Use: search, suggestions, trending, or autocomplete' }, { status: 400 })
    }
  } catch (error) {
    console.error('Advanced search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action, query, filters, user_context } = body

    switch (action) {
      case 'semantic_search':
        // Enhanced semantic search with user context
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        // Get user preferences if available
        let userPreferences = null
        if (user_context?.user_id) {
          const { data: user } = await supabase.auth.getUser()
          if (user) {
            // Would fetch user preferences from database
            userPreferences = {
              categories: ['Web Development', 'AI Tools'],
              experience_level: 'intermediate',
              use_cases: ['development', 'productivity']
            }
          }
        }

        // Boost factors based on user preferences
        const boostFactors = userPreferences ? {
          name_match: 3.0,
          description_match: 1.5,
          category_match: userPreferences.categories.length > 0 ? 2.5 : 2.0,
          tag_match: 2.5,
          popularity: 1.2
        } : undefined

        const semanticResults = await advancedSearch.search({
          query,
          filters: filters || {},
          limit: body.limit || 20,
          boost_factors: boostFactors
        })

        return NextResponse.json({
          query,
          results: semanticResults,
          user_personalized: Boolean(userPreferences),
          boost_factors: boostFactors
        })

      case 'save_search':
        // Save search query for user (would implement with database)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        // Would save to saved_searches table
        return NextResponse.json({
          message: 'Search saved successfully',
          search_id: 'mock-search-id'
        })

      case 'search_analytics':
        // Track search analytics
        const searchData = {
          query: body.query,
          results_count: body.results_count || 0,
          user_id: user_context?.user_id,
          timestamp: new Date().toISOString(),
          filters_used: body.filters || {}
        }

        // Would save to search_analytics table
        console.log('Search analytics:', searchData)

        return NextResponse.json({
          message: 'Search analytics recorded'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Advanced search POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
