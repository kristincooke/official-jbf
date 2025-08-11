import { createClient } from './supabase-server'

interface GitHubRepo {
  name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  topics: string[]
  created_at: string
  updated_at: string
}

interface NPMPackage {
  name: string
  description: string
  homepage?: string
  repository?: {
    url: string
  }
  keywords: string[]
  downloads: number
}

interface DiscoveredTool {
  name: string
  description: string
  website_url?: string
  github_url?: string
  category_suggestion: string
  confidence_score: number
  source: 'github' | 'npm' | 'social' | 'jobs'
  metadata: any
}

export class ToolDiscoveryPipeline {
  private static instance: ToolDiscoveryPipeline
  
  static getInstance(): ToolDiscoveryPipeline {
    if (!ToolDiscoveryPipeline.instance) {
      ToolDiscoveryPipeline.instance = new ToolDiscoveryPipeline()
    }
    return ToolDiscoveryPipeline.instance
  }

  /**
   * Discover trending tools from GitHub
   */
  async discoverFromGitHub(limit: number = 50): Promise<DiscoveredTool[]> {
    try {
      // This would typically use the GitHub API
      // For demo purposes, we'll simulate the discovery process
      const mockGitHubRepos: GitHubRepo[] = [
        {
          name: 'shadcn/ui',
          description: 'Beautifully designed components built with Radix UI and Tailwind CSS.',
          html_url: 'https://github.com/shadcn/ui',
          stargazers_count: 45000,
          language: 'TypeScript',
          topics: ['react', 'tailwindcss', 'components', 'ui'],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          name: 'microsoft/playwright',
          description: 'Playwright is a framework for Web Testing and Automation.',
          html_url: 'https://github.com/microsoft/playwright',
          stargazers_count: 55000,
          language: 'TypeScript',
          topics: ['testing', 'automation', 'browser', 'e2e'],
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      return mockGitHubRepos.map(repo => ({
        name: repo.name.split('/')[1] || repo.name,
        description: repo.description,
        github_url: repo.html_url,
        category_suggestion: this.categorizeFromTopics(repo.topics),
        confidence_score: this.calculateGitHubConfidence(repo),
        source: 'github' as const,
        metadata: {
          stars: repo.stargazers_count,
          language: repo.language,
          topics: repo.topics,
          last_updated: repo.updated_at
        }
      }))
    } catch (error) {
      console.error('Error discovering from GitHub:', error)
      return []
    }
  }

  /**
   * Discover popular tools from NPM
   */
  async discoverFromNPM(limit: number = 50): Promise<DiscoveredTool[]> {
    try {
      // This would typically use the NPM API
      // For demo purposes, we'll simulate the discovery process
      const mockNPMPackages: NPMPackage[] = [
        {
          name: 'vite',
          description: 'Next generation frontend tooling. It\'s fast!',
          homepage: 'https://vitejs.dev',
          repository: { url: 'https://github.com/vitejs/vite' },
          keywords: ['frontend', 'hmr', 'dev-server', 'build-tool', 'vite'],
          downloads: 15000000
        },
        {
          name: 'prisma',
          description: 'Next-generation Node.js and TypeScript ORM',
          homepage: 'https://prisma.io',
          repository: { url: 'https://github.com/prisma/prisma' },
          keywords: ['orm', 'database', 'typescript', 'nodejs'],
          downloads: 2000000
        }
      ]

      return mockNPMPackages.map(pkg => ({
        name: pkg.name,
        description: pkg.description,
        website_url: pkg.homepage,
        github_url: pkg.repository?.url?.replace('git+', '').replace('.git', ''),
        category_suggestion: this.categorizeFromKeywords(pkg.keywords),
        confidence_score: this.calculateNPMConfidence(pkg),
        source: 'npm' as const,
        metadata: {
          downloads: pkg.downloads,
          keywords: pkg.keywords
        }
      }))
    } catch (error) {
      console.error('Error discovering from NPM:', error)
      return []
    }
  }

  /**
   * Analyze social media mentions and sentiment
   */
  async analyzeSocialMentions(toolName: string): Promise<{
    mention_count: number
    sentiment_score: number
    trending_score: number
  }> {
    try {
      // This would typically integrate with Twitter API, Reddit API, etc.
      // For demo purposes, we'll simulate the analysis
      const mockAnalysis = {
        mention_count: Math.floor(Math.random() * 1000) + 100,
        sentiment_score: Math.random() * 2 - 1, // -1 to 1
        trending_score: Math.random() * 100
      }

      return mockAnalysis
    } catch (error) {
      console.error('Error analyzing social mentions:', error)
      return {
        mention_count: 0,
        sentiment_score: 0,
        trending_score: 0
      }
    }
  }

  /**
   * Analyze job posting technology requirements
   */
  async analyzeJobTrends(): Promise<{ [technology: string]: number }> {
    try {
      // This would typically scrape job boards or use APIs
      // For demo purposes, we'll return mock data
      return {
        'React': 85,
        'TypeScript': 78,
        'Next.js': 65,
        'Tailwind CSS': 45,
        'Prisma': 32,
        'Supabase': 28,
        'Vite': 35,
        'Playwright': 22
      }
    } catch (error) {
      console.error('Error analyzing job trends:', error)
      return {}
    }
  }

  /**
   * Run the complete discovery pipeline
   */
  async runDiscoveryPipeline(): Promise<DiscoveredTool[]> {
    try {
      console.log('Starting tool discovery pipeline...')

      // Discover from multiple sources
      const [githubTools, npmTools] = await Promise.all([
        this.discoverFromGitHub(25),
        this.discoverFromNPM(25)
      ])

      // Combine and deduplicate
      const allTools = [...githubTools, ...npmTools]
      const uniqueTools = this.deduplicateTools(allTools)

      // Enhance with social sentiment
      const enhancedTools = await Promise.all(
        uniqueTools.map(async (tool) => {
          const socialData = await this.analyzeSocialMentions(tool.name)
          return {
            ...tool,
            metadata: {
              ...tool.metadata,
              social_mentions: socialData.mention_count,
              sentiment_score: socialData.sentiment_score,
              trending_score: socialData.trending_score
            }
          }
        })
      )

      // Sort by confidence and trending scores
      const sortedTools = enhancedTools.sort((a, b) => {
        const scoreA = a.confidence_score + (a.metadata.trending_score || 0) / 100
        const scoreB = b.confidence_score + (b.metadata.trending_score || 0) / 100
        return scoreB - scoreA
      })

      console.log(`Discovery pipeline completed. Found ${sortedTools.length} unique tools.`)
      return sortedTools
    } catch (error) {
      console.error('Error in discovery pipeline:', error)
      return []
    }
  }

  /**
   * Auto-submit discovered tools to the database
   */
  async autoSubmitDiscoveredTools(tools: DiscoveredTool[], minConfidence: number = 0.7): Promise<void> {
    try {
      const supabase = await createClient()
      
      // Filter by confidence threshold
      const highConfidenceTools = tools.filter(tool => tool.confidence_score >= minConfidence)
      
      for (const tool of highConfidenceTools) {
        // Check if tool already exists
        const { data: existingTool } = await supabase
          .from('tools')
          .select('id')
          .eq('name', tool.name)
          .single()

        if (existingTool) {
          continue // Skip if already exists
        }

        // Get category ID
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('name', tool.category_suggestion)
          .single()

        if (!category) {
          continue // Skip if category doesn't exist
        }

        // Insert the tool
        const { error } = await supabase
          .from('tools')
          .insert({
            name: tool.name,
            description: tool.description,
            category_id: category.id,
            website_url: tool.website_url,
            github_url: tool.github_url,
            pricing_model: 'freemium', // Default assumption
            free_tier: true // Default assumption for discovered tools
          })

        if (error) {
          console.error(`Error auto-submitting tool ${tool.name}:`, error)
        } else {
          console.log(`Auto-submitted tool: ${tool.name}`)
        }
      }
    } catch (error) {
      console.error('Error in autoSubmitDiscoveredTools:', error)
    }
  }

  /**
   * Categorize tool based on topics/keywords
   */
  private categorizeFromTopics(topics: string[]): string {
    const categoryMap: { [key: string]: string[] } = {
      'Web Development': ['react', 'vue', 'angular', 'frontend', 'backend', 'fullstack', 'web'],
      'Testing & QA': ['testing', 'test', 'e2e', 'unit', 'integration', 'automation'],
      'DevOps & Infrastructure': ['docker', 'kubernetes', 'ci', 'cd', 'deployment', 'infrastructure'],
      'Database & Storage': ['database', 'sql', 'nosql', 'orm', 'prisma', 'mongodb'],
      'Design & Prototyping': ['design', 'ui', 'ux', 'components', 'tailwind', 'css'],
      'AI & Machine Learning': ['ai', 'ml', 'machine-learning', 'tensorflow', 'pytorch'],
      'Mobile Development': ['mobile', 'ios', 'android', 'react-native', 'flutter']
    }

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (topics.some(topic => keywords.includes(topic.toLowerCase()))) {
        return category
      }
    }

    return 'Web Development' // Default category
  }

  /**
   * Categorize tool based on NPM keywords
   */
  private categorizeFromKeywords(keywords: string[]): string {
    return this.categorizeFromTopics(keywords)
  }

  /**
   * Calculate confidence score for GitHub repos
   */
  private calculateGitHubConfidence(repo: GitHubRepo): number {
    let score = 0

    // Star count (normalized)
    score += Math.min(repo.stargazers_count / 10000, 0.4)

    // Recent activity
    const lastUpdate = new Date(repo.updated_at)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    score += daysSinceUpdate < 30 ? 0.3 : daysSinceUpdate < 90 ? 0.2 : 0.1

    // Has description
    score += repo.description ? 0.2 : 0

    // Has topics
    score += repo.topics.length > 0 ? 0.1 : 0

    return Math.min(score, 1.0)
  }

  /**
   * Calculate confidence score for NPM packages
   */
  private calculateNPMConfidence(pkg: NPMPackage): number {
    let score = 0

    // Download count (normalized)
    score += Math.min(pkg.downloads / 1000000, 0.4)

    // Has homepage
    score += pkg.homepage ? 0.2 : 0

    // Has repository
    score += pkg.repository ? 0.2 : 0

    // Has keywords
    score += pkg.keywords.length > 0 ? 0.1 : 0

    // Has description
    score += pkg.description ? 0.1 : 0

    return Math.min(score, 1.0)
  }

  /**
   * Remove duplicate tools from discovery results
   */
  private deduplicateTools(tools: DiscoveredTool[]): DiscoveredTool[] {
    const seen = new Set<string>()
    return tools.filter(tool => {
      const key = tool.name.toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }
}

// Export singleton instance
export const discoveryPipeline = ToolDiscoveryPipeline.getInstance()
