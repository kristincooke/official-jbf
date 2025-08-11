import { NextRequest, NextResponse } from 'next/server'
import { scoringEngine } from '@/lib/scoring'
import { createClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated (optional - scoring can be public)
    const { data: { user } } = await supabase.auth.getUser()
    
    const toolId = params.id

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    // Score the tool
    const scores = await scoringEngine.scoreTool(toolId)

    if (!scores) {
      return NextResponse.json({ error: 'Failed to score tool' }, { status: 500 })
    }

    return NextResponse.json({ scores })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const toolId = params.id

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    // Get existing scores
    const { data: scores, error } = await supabase
      .from('tool_scores')
      .select('*')
      .eq('tool_id', toolId)
      .single()

    if (error) {
      console.error('Error fetching tool scores:', error)
      return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 })
    }

    return NextResponse.json({ scores })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
