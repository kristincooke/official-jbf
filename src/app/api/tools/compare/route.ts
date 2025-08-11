import { NextRequest, NextResponse } from 'next/server'
import { comparisonEngine } from '@/lib/comparison-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool_ids } = body

    if (!tool_ids || !Array.isArray(tool_ids) || tool_ids.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 tool IDs are required for comparison' },
        { status: 400 }
      )
    }

    if (tool_ids.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 tools can be compared at once' },
        { status: 400 }
      )
    }

    const comparisonMatrix = await comparisonEngine.generateComparisonMatrix(tool_ids)

    if (!comparisonMatrix) {
      return NextResponse.json(
        { error: 'Failed to generate comparison matrix' },
        { status: 500 }
      )
    }

    return NextResponse.json({ comparison: comparisonMatrix })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('tool_id')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!toolId) {
      return NextResponse.json(
        { error: 'tool_id parameter is required' },
        { status: 400 }
      )
    }

    const similarTools = await comparisonEngine.findSimilarTools(toolId, limit)

    return NextResponse.json({ similar_tools: similarTools })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
