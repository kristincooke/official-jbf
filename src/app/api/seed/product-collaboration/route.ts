import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { productCollaborationCategory, productCollaborationTools } from '@/data/product-collaboration-tools'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and has admin privileges
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For demo purposes, we'll allow any authenticated user to seed
    // In production, you'd check for admin role

    const results = {
      category: null,
      tools: [],
      errors: []
    }

    try {
      // First, create or get the category
      let { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', productCollaborationCategory.name)
        .single()

      let categoryId: string

      if (existingCategory) {
        categoryId = existingCategory.id
        results.category = { status: 'exists', id: categoryId }
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            name: productCollaborationCategory.name,
            description: productCollaborationCategory.description,
            color_theme: productCollaborationCategory.color_theme
          })
          .select('id')
          .single()

        if (categoryError) {
          throw new Error(`Failed to create category: ${categoryError.message}`)
        }

        categoryId = newCategory.id
        results.category = { status: 'created', id: categoryId }
      }

      // Now seed the tools
      for (const toolData of productCollaborationTools) {
        try {
          // Check if tool already exists
          const { data: existingTool } = await supabase
            .from('tools')
            .select('id, name')
            .eq('name', toolData.name)
            .single()

          if (existingTool) {
            results.tools.push({
              name: toolData.name,
              status: 'exists',
              id: existingTool.id
            })
            continue
          }

          // Create the tool
          const { data: newTool, error: toolError } = await supabase
            .from('tools')
            .insert({
              name: toolData.name,
              description: toolData.description,
              website_url: toolData.website_url,
              github_url: toolData.github_url,
              category_id: categoryId,
              pricing_model: toolData.pricing_model,
              free_tier: toolData.free_tier,
              logo_url: toolData.logo_url,
              status: 'approved', // Auto-approve seeded tools
              submitted_by: user.id,
              metadata: {
                tags: toolData.tags,
                features: toolData.features,
                integrations: toolData.integrations,
                target_users: toolData.target_users,
                seeded: true,
                seeded_at: new Date().toISOString()
              }
            })
            .select('id, name')
            .single()

          if (toolError) {
            results.errors.push({
              tool: toolData.name,
              error: toolError.message
            })
            continue
          }

          // Create initial scoring for the tool
          const baseScore = 0.85 + Math.random() * 0.1 // Random score between 0.85-0.95
          
          await supabase
            .from('tool_scores')
            .insert({
              tool_id: newTool.id,
              overall_score: baseScore,
              accessibility_score: baseScore + (Math.random() * 0.1 - 0.05),
              performance_score: baseScore + (Math.random() * 0.1 - 0.05),
              innovation_score: baseScore + (Math.random() * 0.1 - 0.05),
              enterprise_score: baseScore + (Math.random() * 0.1 - 0.05),
              last_calculated: new Date().toISOString()
            })

          results.tools.push({
            name: toolData.name,
            status: 'created',
            id: newTool.id,
            score: baseScore
          })

        } catch (toolError) {
          results.errors.push({
            tool: toolData.name,
            error: toolError instanceof Error ? toolError.message : 'Unknown error'
          })
        }
      }

      return NextResponse.json({
        message: 'Product Collaboration AI tools seeded successfully',
        results,
        summary: {
          category_status: results.category?.status,
          tools_created: results.tools.filter(t => t.status === 'created').length,
          tools_existed: results.tools.filter(t => t.status === 'exists').length,
          errors: results.errors.length
        }
      })

    } catch (error) {
      console.error('Seeding error:', error)
      return NextResponse.json({ 
        error: 'Failed to seed data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Product collaboration seeding API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the category and its tools
    const { data: category } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        color_theme,
        tools(
          id,
          name,
          description,
          website_url,
          github_url,
          pricing_model,
          free_tier,
          logo_url,
          metadata,
          scores:tool_scores(overall_score),
          reviews(count)
        )
      `)
      .eq('name', productCollaborationCategory.name)
      .single()

    if (!category) {
      return NextResponse.json({ 
        message: 'Product Collaboration AI category not found. Run POST to seed the data first.' 
      }, { status: 404 })
    }

    // Calculate some statistics
    const tools = category.tools || []
    const avgScore = tools.length > 0 
      ? tools.reduce((sum, tool) => sum + (tool.scores?.overall_score || 0), 0) / tools.length 
      : 0

    const totalReviews = tools.reduce((sum, tool) => sum + (tool.reviews?.length || 0), 0)

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        color_theme: category.color_theme
      },
      tools,
      statistics: {
        total_tools: tools.length,
        average_score: avgScore,
        total_reviews: totalReviews,
        free_tools: tools.filter(t => t.free_tier).length,
        paid_tools: tools.filter(t => !t.free_tier).length
      }
    })

  } catch (error) {
    console.error('Product collaboration GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
