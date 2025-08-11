import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const toolId = searchParams.get('tool_id')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:auth.users(email)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (toolId) {
      query = query.eq('tool_id', toolId)
    }

    const { data: reviews, error } = await query

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    return NextResponse.json({ reviews })
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
    const { tool_id, rating, review_text, pros, cons } = body

    // Validate required fields
    if (!tool_id || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: tool_id, rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this tool
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('tool_id', tool_id)
      .eq('user_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this tool' },
        { status: 409 }
      )
    }

    // Insert the review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        tool_id,
        user_id: user.id,
        rating,
        review_text,
        pros,
        cons
      })
      .select(`
        *,
        user:auth.users(email)
      `)
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
