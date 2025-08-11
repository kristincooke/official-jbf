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
    const { 
      type, 
      tool_name, 
      description, 
      category, 
      features,
      tool_id,
      comparison_tools 
    } = body

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 })
    }

    let result

    switch (type) {
      case 'enhance_description':
        if (!tool_name || !description) {
          return NextResponse.json(
            { error: 'tool_name and description are required for description enhancement' },
            { status: 400 }
          )
        }
        
        result = await aiService.generateToolDescription(
          tool_name,
          description,
          category || 'Web Development',
          features
        )
        
        // Optionally update the tool in the database
        if (tool_id) {
          await supabase
            .from('tools')
            .update({ description: result.content })
            .eq('id', tool_id)
        }
        
        break

      case 'generate_comparison':
        if (!comparison_tools || !Array.isArray(comparison_tools) || comparison_tools.length < 2) {
          return NextResponse.json(
            { error: 'At least 2 tools are required for comparison generation' },
            { status: 400 }
          )
        }
        
        result = await aiService.generateToolComparison(comparison_tools)
        break

      case 'generate_pros_cons':
        if (!tool_name || !description) {
          return NextResponse.json(
            { error: 'tool_name and description are required for pros/cons generation' },
            { status: 400 }
          )
        }
        
        result = await aiService.generateProsCons(tool_name, description, category)
        break

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI content generation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('tool_id')
    const type = searchParams.get('type') || 'enhance_description'

    if (!toolId) {
      return NextResponse.json({ error: 'tool_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get tool data
    const { data: tool, error } = await supabase
      .from('tools')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('id', toolId)
      .single()

    if (error || !tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    let result

    switch (type) {
      case 'enhance_description':
        result = await aiService.generateToolDescription(
          tool.name,
          tool.description,
          tool.category?.name || 'Web Development'
        )
        break

      case 'generate_pros_cons':
        result = await aiService.generateProsCons(
          tool.name,
          tool.description,
          tool.category?.name || 'Web Development'
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI content generation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
