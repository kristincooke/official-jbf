import { createClient } from './supabase-server'

interface Tool {
  id: string
  name: string
  description: string
  category_id: string
  pricing_model: string | null
  free_tier: boolean
  website_url: string | null
  github_url: string | null
  category?: {
    name: string
    color_theme: string | null
  }
  scores?: {
    overall_score: number
    accessibility_score: number
    performance_score: number
    innovation_score: number
    enterprise_score: number
  }
}

interface ComparisonMatrix {
  tools: Tool[]
  features: {
    name: string
    values: { [toolId: string]: string | boolean | number }
  }[]
  recommendations: {
    best_overall: Tool
    best_value: Tool
    most_innovative: Tool
    most_accessible: Tool
  }
}

export class ComparisonEngine {
  private static instance: ComparisonEngine
  
  static getInstance(): ComparisonEngine {
    if (!ComparisonEngine.instance) {
      ComparisonEngine.instance = new ComparisonEngine()
    }
    return ComparisonEngine.instance
  }

  /**
   * Find similar tools based on category and features
   */
  async findSimilarTools(toolId: string, limit: number = 5): Promise<Tool[]> {
    try {
      const supabase = await createClient()
      
      // Get the reference tool
      const { data: referenceTool, error: refError } = await supabase
        .from('tools')
        .select(`
          *,
          category:categories(name, color_theme),
          scores:tool_scores(*)
        `)
        .eq('id', toolId)
        .single()

      if (refError || !referenceTool) {
        console.error('Error fetching reference tool:', refError)
        return []
      }

      // Find similar tools in the same category
      const { data: similarTools, error } = await supabase
        .from('tools')
        .select(`
          *,
          category:categories(name, color_theme),
          scores:tool_scores(*)
        `)
        .eq('category_id', referenceTool.category_id)
        .neq('id', toolId)
        .limit(limit)

      if (error) {
        console.error('Error fetching similar tools:', error)
        return []
      }

      // Sort by similarity score (based on pricing model and scores)
      return this.rankSimilarTools(referenceTool, similarTools || [])
    } catch (error) {
      console.error('Error in findSimilarTools:', error)
      return []
    }
  }

  /**
   * Generate a comparison matrix for multiple tools
   */
  async generateComparisonMatrix(toolIds: string[]): Promise<ComparisonMatrix | null> {
    try {
      const supabase = await createClient()
      
      const { data: tools, error } = await supabase
        .from('tools')
        .select(`
          *,
          category:categories(name, color_theme),
          scores:tool_scores(*)
        `)
        .in('id', toolIds)

      if (error || !tools) {
        console.error('Error fetching tools for comparison:', error)
        return null
      }

      // Generate feature comparison matrix
      const features = [
        {
          name: 'Pricing Model',
          values: tools.reduce((acc, tool) => ({
            ...acc,
            [tool.id]: tool.pricing_model || 'Unknown'
          }), {})
        },
        {
          name: 'Free Tier',
          values: tools.reduce((acc, tool) => ({
            ...acc,
            [tool.id]: tool.free_tier ? 'Yes' : 'No'
          }), {})
        },
        {
          name: 'GitHub Available',
          values: tools.reduce((acc, tool) => ({
            ...acc,
            [tool.id]: tool.github_url ? 'Yes' : 'No'
          }), {})
        },
        {
          name: 'Overall Score',
          values: tools.reduce((acc, tool) => ({
            ...acc,
            [tool.id]: tool.scores?.overall_score || 0
          }), {})
        },
        {
          name: 'Accessibility Score',
          values: tools.reduce((acc, tool) => ({
            ...acc,
            [tool.id]: tool.scores?.accessibility_score || 0
          }), {})
        },
        {
          name: 'Performance Score',
          values: tools.reduce((acc, tool) => ({
            ...acc,
            [tool.id]: tool.scores?.performance_score || 0
          }), {})
        },
        {
          name: 'Innovation Score',
          values: tools.reduce((acc, tool) => ({
            ...acc,
            [tool.id]: tool.scores?.innovation_score || 0
          }), {})
        },
        {
          name: 'Enterprise Score',
          values: tools.reduce((acc, tool) => ({
            ...acc,
            [tool.id]: tool.scores?.enterprise_score || 0
          }), {})
        }
      ]

      // Generate recommendations
      const recommendations = {
        best_overall: tools.reduce((best, tool) => 
          (tool.scores?.overall_score || 0) > (best.scores?.overall_score || 0) ? tool : best
        ),
        best_value: tools.filter(t => t.free_tier || t.pricing_model === 'free').reduce((best, tool) => 
          (tool.scores?.overall_score || 0) > (best.scores?.overall_score || 0) ? tool : best
        ) || tools[0],
        most_innovative: tools.reduce((best, tool) => 
          (tool.scores?.innovation_score || 0) > (best.scores?.innovation_score || 0) ? tool : best
        ),
        most_accessible: tools.reduce((best, tool) => 
          (tool.scores?.accessibility_score || 0) > (best.scores?.accessibility_score || 0) ? tool : best
        )
      }

      return {
        tools,
        features,
        recommendations
      }
    } catch (error) {
      console.error('Error in generateComparisonMatrix:', error)
      return null
    }
  }

  /**
   * Get personalized tool recommendations based on user preferences
   */
  async getPersonalizedRecommendations(
    userId: string,
    preferences: {
      categories?: string[]
      pricing_preference?: 'free' | 'paid' | 'any'
      feature_priorities?: ('accessibility' | 'performance' | 'innovation' | 'enterprise')[]
    },
    limit: number = 10
  ): Promise<Tool[]> {
    try {
      const supabase = await createClient()
      
      let query = supabase
        .from('tools')
        .select(`
          *,
          category:categories(name, color_theme),
          scores:tool_scores(*)
        `)

      // Apply category filter
      if (preferences.categories && preferences.categories.length > 0) {
        query = query.in('category_id', preferences.categories)
      }

      // Apply pricing filter
      if (preferences.pricing_preference === 'free') {
        query = query.or('free_tier.eq.true,pricing_model.eq.free,pricing_model.eq.open_source')
      } else if (preferences.pricing_preference === 'paid') {
        query = query.in('pricing_model', ['paid', 'freemium'])
      }

      const { data: tools, error } = await query.limit(limit * 2) // Get more to allow for sorting

      if (error || !tools) {
        console.error('Error fetching tools for recommendations:', error)
        return []
      }

      // Sort by user preferences
      const sortedTools = this.sortByPreferences(tools, preferences)
      
      return sortedTools.slice(0, limit)
    } catch (error) {
      console.error('Error in getPersonalizedRecommendations:', error)
      return []
    }
  }

  /**
   * Rank similar tools by similarity score
   */
  private rankSimilarTools(referenceTool: Tool, candidateTools: Tool[]): Tool[] {
    return candidateTools
      .map(tool => ({
        tool,
        similarity: this.calculateSimilarityScore(referenceTool, tool)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.tool)
  }

  /**
   * Calculate similarity score between two tools
   */
  private calculateSimilarityScore(tool1: Tool, tool2: Tool): number {
    let score = 0

    // Same pricing model
    if (tool1.pricing_model === tool2.pricing_model) {
      score += 0.3
    }

    // Both have free tier
    if (tool1.free_tier === tool2.free_tier) {
      score += 0.2
    }

    // Both have GitHub
    if (!!tool1.github_url === !!tool2.github_url) {
      score += 0.1
    }

    // Similar overall scores
    if (tool1.scores && tool2.scores) {
      const scoreDiff = Math.abs(tool1.scores.overall_score - tool2.scores.overall_score)
      score += Math.max(0, 0.4 - (scoreDiff / 5) * 0.4)
    }

    return score
  }

  /**
   * Sort tools by user preferences
   */
  private sortByPreferences(
    tools: Tool[],
    preferences: {
      feature_priorities?: ('accessibility' | 'performance' | 'innovation' | 'enterprise')[]
    }
  ): Tool[] {
    if (!preferences.feature_priorities || preferences.feature_priorities.length === 0) {
      return tools.sort((a, b) => (b.scores?.overall_score || 0) - (a.scores?.overall_score || 0))
    }

    return tools.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      preferences.feature_priorities!.forEach((priority, index) => {
        const weight = 1 / (index + 1) // Higher weight for earlier priorities
        const scoreKeyA = `${priority}_score` as keyof typeof a.scores
        const scoreKeyB = `${priority}_score` as keyof typeof b.scores
        
        scoreA += (Number(a.scores?.[scoreKeyA]) || 0) * weight
        scoreB += (Number(b.scores?.[scoreKeyB]) || 0) * weight
      })

      return scoreB - scoreA
    })
  }
}

// Export singleton instance
export const comparisonEngine = ComparisonEngine.getInstance()
