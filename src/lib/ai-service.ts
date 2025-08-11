import OpenAI from 'openai'

// Initialize OpenAI client with fallback for demo mode
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

interface CategorizationResult {
  category: string
  confidence: number
  reasoning: string
}

interface ContentGenerationResult {
  content: string
  metadata: {
    tone: string
    length: number
    keywords: string[]
  }
}

interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number // -1 to 1
  emotions: string[]
  summary: string
}

interface TrendAnalysisResult {
  trend_direction: 'rising' | 'stable' | 'declining'
  trend_strength: number // 0 to 1
  key_factors: string[]
  prediction: string
}

export class AIService {
  private static instance: AIService
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Auto-categorize a tool based on its name, description, and metadata
   */
  async categorizeToolWithAI(
    toolName: string,
    description: string,
    websiteUrl?: string,
    githubUrl?: string
  ): Promise<CategorizationResult> {
    if (!openai) {
      // Fallback categorization for demo mode
      return this.fallbackCategorization(toolName, description)
    }

    try {
      const prompt = `
Analyze this developer tool and categorize it into one of these categories:

Categories:
- Animation & Graphics
- AI & Machine Learning  
- No-Code/Low-Code
- Web Development
- Mobile Development
- DevOps & Infrastructure
- Database & Storage
- Testing & QA
- Design & Prototyping
- Analytics & Monitoring

Tool Information:
Name: ${toolName}
Description: ${description}
Website: ${websiteUrl || 'Not provided'}
GitHub: ${githubUrl || 'Not provided'}

Provide your response in JSON format:
{
  "category": "exact category name from the list",
  "confidence": 0.95,
  "reasoning": "brief explanation of why this category fits"
}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        category: result.category || 'Web Development',
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || 'AI categorization'
      }
    } catch (error) {
      console.error('AI categorization error:', error)
      return this.fallbackCategorization(toolName, description)
    }
  }

  /**
   * Generate enhanced tool descriptions
   */
  async generateToolDescription(
    toolName: string,
    basicDescription: string,
    category: string,
    features?: string[]
  ): Promise<ContentGenerationResult> {
    if (!openai) {
      return this.fallbackContentGeneration(basicDescription)
    }

    try {
      const prompt = `
Enhance this developer tool description to be more engaging and informative:

Tool: ${toolName}
Category: ${category}
Current Description: ${basicDescription}
Key Features: ${features?.join(', ') || 'Not specified'}

Create an enhanced description that:
- Is 2-3 sentences long
- Highlights key benefits for developers
- Uses engaging, professional language
- Mentions specific use cases
- Avoids marketing fluff

Return JSON format:
{
  "content": "enhanced description here",
  "tone": "professional/friendly/technical",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        content: result.content || basicDescription,
        metadata: {
          tone: result.tone || 'professional',
          length: result.content?.length || basicDescription.length,
          keywords: result.keywords || []
        }
      }
    } catch (error) {
      console.error('AI content generation error:', error)
      return this.fallbackContentGeneration(basicDescription)
    }
  }

  /**
   * Analyze sentiment of reviews and feedback
   */
  async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    if (!openai) {
      return this.fallbackSentimentAnalysis(text)
    }

    try {
      const prompt = `
Analyze the sentiment of this review/feedback:

Text: "${text}"

Provide detailed sentiment analysis in JSON format:
{
  "sentiment": "positive/negative/neutral",
  "score": 0.8,
  "emotions": ["satisfied", "impressed"],
  "summary": "brief summary of the sentiment"
}

Score should be between -1 (very negative) and 1 (very positive).
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        sentiment: result.sentiment || 'neutral',
        score: result.score || 0,
        emotions: result.emotions || [],
        summary: result.summary || 'Neutral sentiment'
      }
    } catch (error) {
      console.error('AI sentiment analysis error:', error)
      return this.fallbackSentimentAnalysis(text)
    }
  }

  /**
   * Generate personalized tool recommendations
   */
  async generatePersonalizedRecommendations(
    userPreferences: {
      categories: string[]
      experience_level: 'beginner' | 'intermediate' | 'expert'
      project_types: string[]
      budget_preference: 'free' | 'paid' | 'any'
    },
    userHistory: {
      viewed_tools: string[]
      rated_tools: { tool_name: string; rating: number }[]
    }
  ): Promise<string[]> {
    if (!openai) {
      return this.fallbackRecommendations(userPreferences)
    }

    try {
      const prompt = `
Generate personalized tool recommendations based on user profile:

User Preferences:
- Categories: ${userPreferences.categories.join(', ')}
- Experience Level: ${userPreferences.experience_level}
- Project Types: ${userPreferences.project_types.join(', ')}
- Budget: ${userPreferences.budget_preference}

User History:
- Viewed Tools: ${userHistory.viewed_tools.join(', ')}
- Highly Rated Tools: ${userHistory.rated_tools.filter(t => t.rating >= 4).map(t => t.tool_name).join(', ')}

Recommend 5-10 tools that would be most relevant. Focus on:
- Tools in preferred categories
- Appropriate for experience level
- Match project types
- Respect budget preferences
- Similar to highly-rated tools

Return JSON array of tool names:
["tool1", "tool2", "tool3"]
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 300
      })

      const result = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('AI recommendation error:', error)
      return this.fallbackRecommendations(userPreferences)
    }
  }

  /**
   * Generate tool comparison content
   */
  async generateToolComparison(tools: { name: string; description: string; category: string }[]): Promise<ContentGenerationResult> {
    if (!openai) {
      return this.fallbackToolComparison(tools)
    }

    try {
      const prompt = `
Generate a detailed comparison between these developer tools:

${tools.map((tool, index) => `
${index + 1}. ${tool.name} (${tool.category})
   Description: ${tool.description}
`).join('\n')}

Create a comprehensive comparison that covers:
- Key differences and similarities
- Strengths and weaknesses of each
- Use case recommendations
- Which tool is better for different scenarios

Return JSON format:
{
  "content": "detailed comparison text",
  "tone": "analytical",
  "keywords": ["comparison", "tools", "differences"]
}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 600
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        content: result.content || 'Comparison not available',
        metadata: {
          tone: result.tone || 'analytical',
          length: result.content?.length || 0,
          keywords: result.keywords || []
        }
      }
    } catch (error) {
      console.error('AI tool comparison error:', error)
      return this.fallbackToolComparison(tools)
    }
  }

  /**
   * Generate pros and cons for a tool
   */
  async generateProsCons(toolName: string, description: string, category: string): Promise<{
    pros: string[]
    cons: string[]
    summary: string
  }> {
    if (!openai) {
      return this.fallbackProsCons(toolName, description)
    }

    try {
      const prompt = `
Analyze this developer tool and generate balanced pros and cons:

Tool: ${toolName}
Category: ${category}
Description: ${description}

Provide 3-5 pros and 3-5 cons based on typical developer experiences with tools in this category.
Be realistic and helpful, not overly positive or negative.

Return JSON format:
{
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"],
  "summary": "brief balanced summary"
}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 400
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        pros: result.pros || ['Easy to use', 'Good documentation'],
        cons: result.cons || ['Learning curve', 'Limited features'],
        summary: result.summary || 'Balanced tool with trade-offs'
      }
    } catch (error) {
      console.error('AI pros/cons generation error:', error)
      return this.fallbackProsCons(toolName, description)
    }
  }

  /**
   * Analyze trends and predict future directions
   */
  async analyzeTrends(
    toolData: {
      name: string
      category: string
      github_stars?: number
      npm_downloads?: number
      recent_mentions: number
      sentiment_score: number
    }[]
  ): Promise<TrendAnalysisResult[]> {
    if (!openai) {
      return this.fallbackTrendAnalysis(toolData)
    }

    try {
      const prompt = `
Analyze trends for these developer tools:

${toolData.map(tool => `
- ${tool.name} (${tool.category})
  GitHub Stars: ${tool.github_stars || 'N/A'}
  NPM Downloads: ${tool.npm_downloads || 'N/A'}
  Recent Mentions: ${tool.recent_mentions}
  Sentiment: ${tool.sentiment_score}
`).join('\n')}

For each tool, analyze:
1. Current trend direction (rising/stable/declining)
2. Trend strength (0-1)
3. Key factors driving the trend
4. Future prediction

Return JSON array:
[{
  "tool_name": "tool1",
  "trend_direction": "rising",
  "trend_strength": 0.8,
  "key_factors": ["factor1", "factor2"],
  "prediction": "brief prediction"
}]
`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 800
      })

      const result = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error('AI trend analysis error:', error)
      return this.fallbackTrendAnalysis(toolData)
    }
  }

  // Fallback methods for demo mode
  private fallbackCategorization(toolName: string, description: string): CategorizationResult {
    const keywords = description.toLowerCase()
    
    if (keywords.includes('react') || keywords.includes('vue') || keywords.includes('frontend')) {
      return { category: 'Web Development', confidence: 0.7, reasoning: 'Keyword-based categorization' }
    }
    if (keywords.includes('test') || keywords.includes('automation')) {
      return { category: 'Testing & QA', confidence: 0.7, reasoning: 'Keyword-based categorization' }
    }
    if (keywords.includes('design') || keywords.includes('ui')) {
      return { category: 'Design & Prototyping', confidence: 0.7, reasoning: 'Keyword-based categorization' }
    }
    
    return { category: 'Web Development', confidence: 0.5, reasoning: 'Default categorization' }
  }

  private fallbackContentGeneration(description: string): ContentGenerationResult {
    return {
      content: description,
      metadata: {
        tone: 'professional',
        length: description.length,
        keywords: []
      }
    }
  }

  private fallbackSentimentAnalysis(text: string): SentimentAnalysisResult {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'useless']
    
    const words = text.toLowerCase().split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.includes(word)).length
    const negativeCount = words.filter(word => negativeWords.includes(word)).length
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    let score = 0
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive'
      score = Math.min(positiveCount * 0.3, 1)
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative'
      score = Math.max(negativeCount * -0.3, -1)
    }
    
    return {
      sentiment,
      score,
      emotions: sentiment === 'positive' ? ['satisfied'] : sentiment === 'negative' ? ['disappointed'] : ['neutral'],
      summary: `${sentiment} sentiment detected`
    }
  }

  private fallbackRecommendations(preferences: any): string[] {
    const recommendations = [
      'React', 'Vue.js', 'Next.js', 'TypeScript', 'Tailwind CSS',
      'Vite', 'Prisma', 'Supabase', 'Vercel', 'Figma'
    ]
    
    return recommendations.slice(0, 5)
  }

  private fallbackTrendAnalysis(toolData: any[]): TrendAnalysisResult[] {
    return toolData.map(tool => ({
      trend_direction: 'stable' as const,
      trend_strength: 0.5,
      key_factors: ['Community engagement', 'Regular updates'],
      prediction: 'Expected to maintain current trajectory'
    }))
  }

  private fallbackToolComparison(tools: { name: string; description: string; category: string }[]): ContentGenerationResult {
    const toolNames = tools.map(t => t.name).join(' vs ')
    const content = `Comparison between ${toolNames}: Both tools serve similar purposes in the ${tools[0].category} category. Each has its own strengths and is suitable for different use cases. Consider your specific requirements when choosing between them.`
    
    return {
      content,
      metadata: {
        tone: 'analytical',
        length: content.length,
        keywords: ['comparison', 'tools', 'evaluation']
      }
    }
  }

  private fallbackProsCons(toolName: string, description: string): {
    pros: string[]
    cons: string[]
    summary: string
  } {
    return {
      pros: [
        'Easy to get started',
        'Good community support',
        'Regular updates',
        'Well documented'
      ],
      cons: [
        'Learning curve for beginners',
        'May have limitations for complex use cases',
        'Requires time investment to master'
      ],
      summary: `${toolName} is a solid tool with both advantages and trade-offs to consider.`
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance()
