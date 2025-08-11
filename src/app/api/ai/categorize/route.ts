import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
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
    const { tool_name, description, website_url, github_url } = body

    if (!tool_name || !description) {
      return NextResponse.json(
        { error: 'tool_name and description are required' },
        { status: 400 }
      )
    }

    // Use AI to categorize the tool
    const categorization = await aiService.categorizeToolWithAI(
      tool_name,
      description,
      website_url,
      github_url
    )

    // Find the matching category in the database
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', categorization.category)
      .single()

    if (categoryError || !category) {
      // If exact match not found, return the AI suggestion anyway
      return NextResponse.json({
        categorization: {
          ...categorization,
          category_id: null,
          message: 'AI suggested category not found in database'
        }
      })
    }

    return NextResponse.json({
      categorization: {
        ...categorization,
        category_id: category.id
      }
    })
  } catch (error) {
    console.error('AI categorization API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('tool_id')

    if (!toolId) {
      return NextResponse.json({ error: 'tool_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get tool data
    const { data: tool, error } = await supabase
      .from('tools')
      .select('name, description, website_url, github_url')
      .eq('id', toolId)
      .single()

    if (error || !tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    // Re-categorize the tool
    const categorization = await aiService.categorizeToolWithAI(
      tool.name,
      tool.description,
      tool.website_url,
      tool.github_url
    )

    return NextResponse.json({ categorization })
  } catch (error) {
    console.error('AI categorization API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
