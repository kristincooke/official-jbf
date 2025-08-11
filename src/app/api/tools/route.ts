import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const pricing = searchParams.get('pricing')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('tools')
      .select(`
        *,
        category:categories(name, color_theme),
        scores:tool_scores(overall_score, accessibility_score, performance_score, innovation_score, enterprise_score),
        _count:reviews(count)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('categories.name', category)
    }

    if (pricing) {
      if (pricing === 'free_tier') {
        query = query.eq('free_tier', true)
      } else {
        query = query.eq('pricing_model', pricing)
      }
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: tools, error } = await query

    if (error) {
      console.error('Error fetching tools:', error)
      return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
    }

    return NextResponse.json({ tools })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      name,
      description,
      category_id,
      website_url,
      github_url,
      pricing_model,
      free_tier,
      logo_url
    } = body

    // Validate required fields
    if (!name || !description || !category_id || !website_url) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category_id, website_url' },
        { status: 400 }
      )
    }

    // Insert the tool
    const { data: tool, error } = await supabase
      .from('tools')
      .insert({
        name,
        description,
        category_id,
        website_url,
        github_url,
        pricing_model,
        free_tier: free_tier || false,
        logo_url
      })
      .select(`
        *,
        category:categories(name, color_theme)
      `)
      .single()

    if (error) {
      console.error('Error creating tool:', error)
      return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 })
    }

    // Initialize tool scores
    await supabase
      .from('tool_scores')
      .insert({
        tool_id: tool.id,
        accessibility_score: 3.0,
        performance_score: 3.0,
        innovation_score: 3.0,
        enterprise_score: 3.0,
        overall_score: 3.0
      })

    return NextResponse.json({ tool }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
