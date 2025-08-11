interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  license: {
    key: string
    name: string
  } | null
  owner: {
    login: string
    avatar_url: string
    type: string
  }
}

interface GitHubSearchResult {
  total_count: number
  incomplete_results: boolean
  items: GitHubRepo[]
}

interface ProcessedRepoData {
  name: string
  description: string
  website_url: string
  github_url: string
  category: string
  pricing_model: string
  free_tier: boolean
  metadata: {
    stars: number
    forks: number
    language: string
    topics: string[]
    last_updated: string
    license: string
  }
}

class GitHubService {
  private baseUrl = 'https://api.github.com'
  private token: string | null

  constructor() {
    this.token = process.env.GITHUB_TOKEN || null
  }

  private async makeRequest(endpoint: string, params?: Record<string, string>): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'JuiceBox-Factory/1.0'
    }

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }

    try {
      const response = await fetch(url.toString(), { headers })
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('GitHub API request failed:', error)
      throw error
    }
  }

  /**
   * Search for repositories by query
   */
  async searchRepositories(
    query: string, 
    options: {
      sort?: 'stars' | 'forks' | 'updated'
      order?: 'asc' | 'desc'
      per_page?: number
      page?: number
    } = {}
  ): Promise<GitHubSearchResult> {
    const params = {
      q: query,
      sort: options.sort || 'stars',
      order: options.order || 'desc',
      per_page: (options.per_page || 30).toString(),
      page: (options.page || 1).toString()
    }

    return await this.makeRequest('/search/repositories', params)
  }

  /**
   * Get trending repositories for specific topics
   */
  async getTrendingRepos(
    topics: string[] = ['javascript', 'typescript', 'react', 'vue', 'angular', 'nodejs'],
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<GitHubRepo[]> {
    const dateThreshold = new Date()
    switch (timeframe) {
      case 'daily':
        dateThreshold.setDate(dateThreshold.getDate() - 1)
        break
      case 'weekly':
        dateThreshold.setDate(dateThreshold.getDate() - 7)
        break
      case 'monthly':
        dateThreshold.setMonth(dateThreshold.getMonth() - 1)
        break
    }

    const dateString = dateThreshold.toISOString().split('T')[0]
    const topicQuery = topics.map(topic => `topic:${topic}`).join(' OR ')
    const query = `${topicQuery} created:>${dateString} stars:>10`

    try {
      const result = await this.searchRepositories(query, {
        sort: 'stars',
        order: 'desc',
        per_page: 50
      })

      return result.items
    } catch (error) {
      console.error('Failed to fetch trending repos:', error)
      return []
    }
  }

  /**
   * Get repository details by owner and repo name
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
      return await this.makeRequest(`/repos/${owner}/${repo}`)
    } catch (error) {
      console.error(`Failed to fetch repo ${owner}/${repo}:`, error)
      return null
    }
  }

  /**
   * Process repository data for tool submission
   */
  processRepoForTool(repo: GitHubRepo): ProcessedRepoData {
    // Determine category based on topics and language
    const category = this.categorizeRepo(repo)
    
    // Determine pricing model (assume open source is free)
    const pricingModel = repo.license ? 'Free' : 'Unknown'
    const freeTier = Boolean(repo.license)

    return {
      name: repo.name,
      description: repo.description || `${repo.name} - A ${repo.language || 'development'} tool`,
      website_url: repo.html_url,
      github_url: repo.html_url,
      category,
      pricing_model: pricingModel,
      free_tier: freeTier,
      metadata: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Unknown',
        topics: repo.topics,
        last_updated: repo.updated_at,
        license: repo.license?.name || 'Unknown'
      }
    }
  }

  /**
   * Categorize repository based on topics and language
   */
  private categorizeRepo(repo: GitHubRepo): string {
    const topics = repo.topics.map(t => t.toLowerCase())
    const language = repo.language?.toLowerCase() || ''

    // AI/ML Tools
    if (topics.some(t => ['ai', 'ml', 'machine-learning', 'artificial-intelligence', 'deep-learning', 'tensorflow', 'pytorch'].includes(t))) {
      return 'AI Tools'
    }

    // Frontend Frameworks
    if (topics.some(t => ['react', 'vue', 'angular', 'svelte', 'frontend', 'ui'].includes(t)) || 
        ['javascript', 'typescript'].includes(language)) {
      return 'Frontend Frameworks'
    }

    // Backend Tools
    if (topics.some(t => ['backend', 'api', 'server', 'database', 'nodejs', 'express'].includes(t)) ||
        ['python', 'java', 'go', 'rust'].includes(language)) {
      return 'Backend Tools'
    }

    // DevOps
    if (topics.some(t => ['devops', 'docker', 'kubernetes', 'ci-cd', 'deployment', 'infrastructure'].includes(t))) {
      return 'DevOps'
    }

    // Design Tools
    if (topics.some(t => ['design', 'ui-ux', 'figma', 'sketch', 'animation'].includes(t))) {
      return 'Design Tools'
    }

    // Testing
    if (topics.some(t => ['testing', 'test', 'jest', 'cypress', 'selenium'].includes(t))) {
      return 'Testing'
    }

    // Mobile Development
    if (topics.some(t => ['mobile', 'ios', 'android', 'react-native', 'flutter'].includes(t)) ||
        ['swift', 'kotlin', 'dart'].includes(language)) {
      return 'Mobile Development'
    }

    // Default to Web Development
    return 'Web Development'
  }

  /**
   * Discover new tools from GitHub trending
   */
  async discoverNewTools(limit: number = 20): Promise<ProcessedRepoData[]> {
    try {
      const trendingRepos = await this.getTrendingRepos()
      
      return trendingRepos
        .slice(0, limit)
        .map(repo => this.processRepoForTool(repo))
        .filter(tool => tool.description.length > 20) // Filter out repos with poor descriptions
    } catch (error) {
      console.error('Failed to discover new tools:', error)
      return []
    }
  }

  /**
   * Get repository statistics for existing tools
   */
  async getRepoStats(githubUrl: string): Promise<{
    stars: number
    forks: number
    issues: number
    lastUpdate: string
  } | null> {
    try {
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!match) return null

      const [, owner, repo] = match
      const repoData = await this.getRepository(owner, repo)
      
      if (!repoData) return null

      return {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: 0, // Would need additional API call
        lastUpdate: repoData.updated_at
      }
    } catch (error) {
      console.error('Failed to get repo stats:', error)
      return null
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService()
export type { GitHubRepo, ProcessedRepoData }
