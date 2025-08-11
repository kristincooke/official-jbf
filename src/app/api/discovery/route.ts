import { NextRequest, NextResponse } from 'next/server'
import { discoveryPipeline } from '@/lib/discovery-pipeline'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, auto_submit = false, min_confidence = 0.7 } = body

    if (action === 'run_pipeline') {
      const discoveredTools = await discoveryPipeline.runDiscoveryPipeline()
      
      if (auto_submit) {
        await discoveryPipeline.autoSubmitDiscoveredTools(discoveredTools, min_confidence)
      }

      return NextResponse.json({ 
        discovered_tools: discoveredTools,
        auto_submitted: auto_submit
      })
    }

    if (action === 'analyze_social') {
      const { tool_name } = body
      if (!tool_name) {
        return NextResponse.json({ error: 'tool_name is required' }, { status: 400 })
      }

      const socialData = await discoveryPipeline.analyzeSocialMentions(tool_name)
      return NextResponse.json({ social_data: socialData })
    }

    if (action === 'job_trends') {
      const jobTrends = await discoveryPipeline.analyzeJobTrends()
      return NextResponse.json({ job_trends: jobTrends })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    let discoveredTools = []

    if (source === 'github' || source === 'all') {
      const githubTools = await discoveryPipeline.discoverFromGitHub(limit)
      discoveredTools.push(...githubTools)
    }

    if (source === 'npm' || source === 'all') {
      const npmTools = await discoveryPipeline.discoverFromNPM(limit)
      discoveredTools.push(...npmTools)
    }

    return NextResponse.json({ discovered_tools: discoveredTools })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
