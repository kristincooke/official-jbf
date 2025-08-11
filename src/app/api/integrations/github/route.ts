import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/lib/integrations/github-service'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '20')

    switch (action) {
      case 'discover':
        // Discover new tools from GitHub trending
        const newTools = await githubService.discoverNewTools(limit)
        return NextResponse.json({
          action: 'discover',
          tools: newTools,
          count: newTools.length
        })

      case 'trending':
        // Get trending repositories
        const timeframe = searchParams.get('timeframe') as 'daily' | 'weekly' | 'monthly' || 'weekly'
        const topics = searchParams.get('topics')?.split(',') || undefined
        
        const trendingRepos = await githubService.getTrendingRepos(topics, timeframe)
        const processedRepos = trendingRepos.map(repo => githubService.processRepoForTool(repo))
        
        return NextResponse.json({
          action: 'trending',
          timeframe,
          topics: topics || ['javascript', 'typescript', 'react', 'vue', 'angular', 'nodejs'],
          repositories: processedRepos,
          count: processedRepos.length
        })

      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter is required for search' }, { status: 400 })
        }

        const searchResults = await githubService.searchRepositories(query, {
          per_page: limit,
          sort: 'stars',
          order: 'desc'
        })

        const processedResults = searchResults.items.map(repo => githubService.processRepoForTool(repo))

        return NextResponse.json({
          action: 'search',
          query,
          results: processedResults,
          total_count: searchResults.total_count,
          count: processedResults.length
        })

      case 'stats':
        const githubUrl = searchParams.get('github_url')
        if (!githubUrl) {
          return NextResponse.json({ error: 'github_url parameter is required for stats' }, { status: 400 })
        }

        const stats = await githubService.getRepoStats(githubUrl)
        return NextResponse.json({
          action: 'stats',
          github_url: githubUrl,
          stats
        })

      default:
        return NextResponse.json({ error: 'Invalid action. Use: discover, trending, search, or stats' }, { status: 400 })
    }
  } catch (error) {
    console.error('GitHub integration API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and has admin privileges
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, tools, auto_submit = false } = body

    switch (action) {
      case 'bulk_discover':
        // Discover and optionally auto-submit tools
        const discoveredTools = await githubService.discoverNewTools(50)
        
        let submittedCount = 0
        const results = []

        if (auto_submit) {
          // Get existing tools to avoid duplicates
          const { data: existingTools } = await supabase
            .from('tools')
            .select('github_url')
            .not('github_url', 'is', null)

          const existingUrls = new Set(existingTools?.map(t => t.github_url) || [])

          for (const tool of discoveredTools) {
            if (!existingUrls.has(tool.github_url)) {
              try {
                // Get or create category
                let { data: category } = await supabase
                  .from('categories')
                  .select('id')
                  .eq('name', tool.category)
                  .single()

                if (!category) {
                  const { data: newCategory } = await supabase
                    .from('categories')
                    .insert({
                      name: tool.category,
                      description: `Tools and resources for ${tool.category}`,
                      color_theme: '#6366f1'
                    })
                    .select('id')
                    .single()
                  
                  category = newCategory
                }

                // Submit tool
                const { data: newTool, error: toolError } = await supabase
                  .from('tools')
                  .insert({
                    name: tool.name,
                    description: tool.description,
                    website_url: tool.website_url,
                    github_url: tool.github_url,
                    category_id: category?.id,
                    pricing_model: tool.pricing_model,
                    free_tier: tool.free_tier,
                    status: 'pending',
                    submitted_by: user.id,
                    metadata: tool.metadata
                  })
                  .select()
                  .single()

                if (!toolError && newTool) {
                  submittedCount++
                  results.push({
                    tool: newTool,
                    status: 'submitted',
                    github_data: tool.metadata
                  })
                }
              } catch (error) {
                console.error(`Failed to submit tool ${tool.name}:`, error)
                results.push({
                  tool: tool,
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Unknown error'
                })
              }
            } else {
              results.push({
                tool: tool,
                status: 'duplicate',
                message: 'Tool already exists'
              })
            }
          }
        }

        return NextResponse.json({
          action: 'bulk_discover',
          discovered_count: discoveredTools.length,
          submitted_count: submittedCount,
          auto_submit,
          results: auto_submit ? results : discoveredTools
        })

      case 'update_stats':
        // Update GitHub stats for existing tools
        if (!tools || !Array.isArray(tools)) {
          return NextResponse.json({ error: 'tools array is required' }, { status: 400 })
        }

        const updateResults = []

        for (const toolId of tools) {
          try {
            const { data: tool } = await supabase
              .from('tools')
              .select('id, name, github_url')
              .eq('id', toolId)
              .single()

            if (tool?.github_url) {
              const stats = await githubService.getRepoStats(tool.github_url)
              
              if (stats) {
                // Update tool metadata
                const updatedMetadata = {
                  github_stats: stats,
                  last_github_sync: new Date().toISOString()
                }

                await supabase
                  .from('tools')
                  .update({ metadata: updatedMetadata })
                  .eq('id', toolId)

                updateResults.push({
                  tool_id: toolId,
                  tool_name: tool.name,
                  status: 'updated',
                  stats
                })
              }
            }
          } catch (error) {
            updateResults.push({
              tool_id: toolId,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }

        return NextResponse.json({
          action: 'update_stats',
          results: updateResults,
          updated_count: updateResults.filter(r => r.status === 'updated').length
        })

      default:
        return NextResponse.json({ error: 'Invalid action. Use: bulk_discover or update_stats' }, { status: 400 })
    }
  } catch (error) {
    console.error('GitHub integration API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
