import { createClient } from './supabase-server'

interface ToolData {
  id: string
  name: string
  description: string
  website_url: string | null
  github_url: string | null
  pricing_model: string | null
  free_tier: boolean
  created_at: string
}

interface ScoringMetrics {
  accessibility_score: number
  performance_score: number
  innovation_score: number
  enterprise_score: number
  overall_score: number
}

export class ToolScoringEngine {
  private static instance: ToolScoringEngine
  
  static getInstance(): ToolScoringEngine {
    if (!ToolScoringEngine.instance) {
      ToolScoringEngine.instance = new ToolScoringEngine()
    }
    return ToolScoringEngine.instance
  }

  /**
   * Calculate accessibility score (25% of overall)
   * Based on: free tier availability, documentation quality, learning curve
   */
  private calculateAccessibilityScore(tool: ToolData): number {
    let score = 2.0 // Base score

    // Free tier or open source gets bonus points
    if (tool.free_tier || tool.pricing_model === 'free' || tool.pricing_model === 'open_source') {
      score += 1.5
    }

    // GitHub presence indicates good documentation/community
    if (tool.github_url) {
      score += 1.0
    }

    // Freemium model shows accessibility
    if (tool.pricing_model === 'freemium') {
      score += 0.5
    }

    return Math.min(5.0, score)
  }

  /**
   * Calculate performance score (25% of overall)
   * Based on: speed, reliability, user satisfaction from reviews
   */
  private calculatePerformanceScore(tool: ToolData, reviewData?: any): number {
    let score = 3.0 // Base score

    // GitHub presence suggests active development
    if (tool.github_url) {
      score += 0.5
    }

    // Newer tools might have performance advantages
    const toolAge = Date.now() - new Date(tool.created_at).getTime()
    const ageInYears = toolAge / (1000 * 60 * 60 * 24 * 365)
    
    if (ageInYears < 1) {
      score += 0.3 // Recent tools might have modern performance
    }

    // TODO: Integrate with actual review sentiment analysis
    if (reviewData?.averageRating) {
      score = (score + reviewData.averageRating) / 2
    }

    return Math.min(5.0, score)
  }

  /**
   * Calculate innovation score (25% of overall)
   * Based on: unique features, recent updates, industry adoption
   */
  private calculateInnovationScore(tool: ToolData): number {
    let score = 2.5 // Base score

    // Open source suggests innovation and community contribution
    if (tool.pricing_model === 'open_source') {
      score += 1.0
    }

    // GitHub presence suggests active development
    if (tool.github_url) {
      score += 0.8
    }

    // Newer tools might be more innovative
    const toolAge = Date.now() - new Date(tool.created_at).getTime()
    const ageInYears = toolAge / (1000 * 60 * 60 * 24 * 365)
    
    if (ageInYears < 2) {
      score += 0.7
    }

    return Math.min(5.0, score)
  }

  /**
   * Calculate enterprise score (25% of overall)
   * Based on: security, scalability, support quality
   */
  private calculateEnterpriseScore(tool: ToolData): number {
    let score = 2.0 // Base score

    // Paid models suggest enterprise focus
    if (tool.pricing_model === 'paid' || tool.pricing_model === 'freemium') {
      score += 1.5
    }

    // Professional website suggests enterprise readiness
    if (tool.website_url) {
      score += 0.8
    }

    // GitHub presence suggests transparency and security
    if (tool.github_url) {
      score += 0.7
    }

    return Math.min(5.0, score)
  }

  /**
   * Calculate overall score as weighted average
   */
  private calculateOverallScore(metrics: Omit<ScoringMetrics, 'overall_score'>): number {
    const weights = {
      accessibility: 0.25,
      performance: 0.25,
      innovation: 0.25,
      enterprise: 0.25
    }

    return (
      metrics.accessibility_score * weights.accessibility +
      metrics.performance_score * weights.performance +
      metrics.innovation_score * weights.innovation +
      metrics.enterprise_score * weights.enterprise
    )
  }

  /**
   * Score a single tool
   */
  async scoreTool(toolId: string): Promise<ScoringMetrics | null> {
    try {
      const supabase = await createClient()
      
      // Get tool data
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single()

      if (toolError || !tool) {
        console.error('Error fetching tool for scoring:', toolError)
        return null
      }

      // Get review data for performance scoring
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('tool_id', toolId)

      const reviewData = reviews?.length ? {
        averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      } : null

      // Calculate individual scores
      const accessibility_score = this.calculateAccessibilityScore(tool)
      const performance_score = this.calculatePerformanceScore(tool, reviewData)
      const innovation_score = this.calculateInnovationScore(tool)
      const enterprise_score = this.calculateEnterpriseScore(tool)
      
      const overall_score = this.calculateOverallScore({
        accessibility_score,
        performance_score,
        innovation_score,
        enterprise_score
      })

      const metrics: ScoringMetrics = {
        accessibility_score: Math.round(accessibility_score * 100) / 100,
        performance_score: Math.round(performance_score * 100) / 100,
        innovation_score: Math.round(innovation_score * 100) / 100,
        enterprise_score: Math.round(enterprise_score * 100) / 100,
        overall_score: Math.round(overall_score * 100) / 100
      }

      // Update or insert scores
      const { error: upsertError } = await supabase
        .from('tool_scores')
        .upsert({
          tool_id: toolId,
          ...metrics
        })

      if (upsertError) {
        console.error('Error updating tool scores:', upsertError)
        return null
      }

      return metrics
    } catch (error) {
      console.error('Error in scoreTool:', error)
      return null
    }
  }

  /**
   * Score all tools in the database
   */
  async scoreAllTools(): Promise<void> {
    try {
      const supabase = await createClient()
      
      const { data: tools, error } = await supabase
        .from('tools')
        .select('id')

      if (error || !tools) {
        console.error('Error fetching tools for scoring:', error)
        return
      }

      console.log(`Starting to score ${tools.length} tools...`)

      for (const tool of tools) {
        await this.scoreTool(tool.id)
        // Add small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      console.log('Finished scoring all tools')
    } catch (error) {
      console.error('Error in scoreAllTools:', error)
    }
  }
}

// Export singleton instance
export const scoringEngine = ToolScoringEngine.getInstance()
