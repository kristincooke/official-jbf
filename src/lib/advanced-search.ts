interface SearchFilters {
  categories?: string[]
  pricing_models?: string[]
  free_tier?: boolean
  min_score?: number
  has_github?: boolean
  languages?: string[]
  tags?: string[]
  date_range?: {
    start: string
    end: string
  }
}

interface SearchResult {
  id: string
  name: string
  description: string
  website_url: string | null
  github_url: string | null
  category: {
    name: string
    color_theme: string | null
  } | null
  scores?: {
    overall_score: number
  } | null
  relevance_score: number
  match_reasons: string[]
}

interface SemanticSearchOptions {
  query: string
  filters?: SearchFilters
  limit?: number
  include_similar?: boolean
  boost_factors?: {
    name_match: number
    description_match: number
    category_match: number
    tag_match: number
    popularity: number
  }
}

class AdvancedSearchService {
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
  ])

  /**
   * Perform advanced search with semantic similarity
   */
  async search(options: SemanticSearchOptions): Promise<SearchResult[]> {
    const { query, filters = {}, limit = 20, boost_factors } = options

    // Tokenize and clean query
    const queryTerms = this.tokenizeQuery(query)
    const semanticTerms = this.expandQuerySemantics(queryTerms)

    // Build search conditions
    const searchConditions = this.buildSearchConditions(queryTerms, semanticTerms, filters)

    // Execute search (this would be replaced with actual Supabase queries)
    const results = await this.executeSearch(searchConditions, limit)

    // Calculate relevance scores
    const scoredResults = results.map(result => ({
      ...result,
      relevance_score: this.calculateRelevanceScore(result, queryTerms, semanticTerms, boost_factors),
      match_reasons: this.getMatchReasons(result, queryTerms, semanticTerms)
    }))

    // Sort by relevance
    return scoredResults.sort((a, b) => b.relevance_score - a.relevance_score)
  }

  /**
   * Tokenize search query into meaningful terms
   */
  private tokenizeQuery(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2 && !this.stopWords.has(term))
  }

  /**
   * Expand query with semantic alternatives and synonyms
   */
  private expandQuerySemantics(terms: string[]): Map<string, string[]> {
    const semanticMap = new Map<string, string[]>()

    // Technology synonyms and related terms
    const synonyms: Record<string, string[]> = {
      'javascript': ['js', 'node', 'nodejs', 'react', 'vue', 'angular'],
      'typescript': ['ts', 'javascript', 'js'],
      'react': ['reactjs', 'jsx', 'javascript', 'frontend'],
      'vue': ['vuejs', 'javascript', 'frontend'],
      'angular': ['angularjs', 'typescript', 'frontend'],
      'python': ['py', 'django', 'flask', 'fastapi'],
      'ai': ['artificial intelligence', 'machine learning', 'ml', 'deep learning'],
      'ml': ['machine learning', 'ai', 'artificial intelligence'],
      'database': ['db', 'sql', 'nosql', 'mongodb', 'postgresql'],
      'api': ['rest', 'graphql', 'endpoint', 'service'],
      'frontend': ['ui', 'ux', 'client', 'browser'],
      'backend': ['server', 'api', 'service'],
      'mobile': ['ios', 'android', 'app', 'smartphone'],
      'design': ['ui', 'ux', 'graphics', 'visual'],
      'testing': ['test', 'qa', 'quality', 'automation'],
      'devops': ['deployment', 'ci', 'cd', 'docker', 'kubernetes'],
      'analytics': ['data', 'metrics', 'tracking', 'insights'],
      'productivity': ['efficiency', 'workflow', 'automation', 'tools']
    }

    terms.forEach(term => {
      const related = synonyms[term] || []
      semanticMap.set(term, related)
    })

    return semanticMap
  }

  /**
   * Build search conditions based on query and filters
   */
  private buildSearchConditions(
    queryTerms: string[], 
    semanticTerms: Map<string, string[]>, 
    filters: SearchFilters
  ) {
    return {
      queryTerms,
      semanticTerms,
      filters,
      searchFields: ['name', 'description', 'category.name', 'tags'],
      boostFields: {
        name: 3.0,
        description: 1.5,
        category: 2.0,
        tags: 2.5
      }
    }
  }

  /**
   * Execute search query (mock implementation)
   */
  private async executeSearch(conditions: any, limit: number): Promise<any[]> {
    // This would be replaced with actual Supabase search
    // For now, return mock data that would come from database
    return [
      {
        id: '1',
        name: 'React Developer Tools',
        description: 'Browser extension for debugging React applications',
        website_url: 'https://react.dev',
        github_url: 'https://github.com/facebook/react-devtools',
        category: { name: 'Frontend Frameworks', color_theme: '#61dafb' },
        scores: { overall_score: 0.92 },
        tags: ['react', 'debugging', 'browser', 'development']
      },
      {
        id: '2',
        name: 'Vue DevTools',
        description: 'Browser devtools extension for debugging Vue.js applications',
        website_url: 'https://vuejs.org',
        github_url: 'https://github.com/vuejs/devtools',
        category: { name: 'Frontend Frameworks', color_theme: '#4fc08d' },
        scores: { overall_score: 0.88 },
        tags: ['vue', 'debugging', 'browser', 'development']
      },
      {
        id: '3',
        name: 'TypeScript',
        description: 'Typed superset of JavaScript that compiles to plain JavaScript',
        website_url: 'https://typescriptlang.org',
        github_url: 'https://github.com/microsoft/TypeScript',
        category: { name: 'Programming Languages', color_theme: '#3178c6' },
        scores: { overall_score: 0.95 },
        tags: ['typescript', 'javascript', 'types', 'compiler']
      }
    ]
  }

  /**
   * Calculate relevance score for search result
   */
  private calculateRelevanceScore(
    result: any,
    queryTerms: string[],
    semanticTerms: Map<string, string[]>,
    boostFactors?: any
  ): number {
    const boost = {
      name_match: 3.0,
      description_match: 1.5,
      category_match: 2.0,
      tag_match: 2.5,
      popularity: 1.0,
      ...boostFactors
    }

    let score = 0
    const text = {
      name: result.name.toLowerCase(),
      description: result.description.toLowerCase(),
      category: result.category?.name.toLowerCase() || '',
      tags: (result.tags || []).join(' ').toLowerCase()
    }

    // Direct term matches
    queryTerms.forEach(term => {
      if (text.name.includes(term)) score += boost.name_match
      if (text.description.includes(term)) score += boost.description_match
      if (text.category.includes(term)) score += boost.category_match
      if (text.tags.includes(term)) score += boost.tag_match
    })

    // Semantic matches
    semanticTerms.forEach((related, term) => {
      related.forEach(relatedTerm => {
        if (text.name.includes(relatedTerm)) score += boost.name_match * 0.7
        if (text.description.includes(relatedTerm)) score += boost.description_match * 0.7
        if (text.category.includes(relatedTerm)) score += boost.category_match * 0.7
        if (text.tags.includes(relatedTerm)) score += boost.tag_match * 0.7
      })
    })

    // Popularity boost
    if (result.scores?.overall_score) {
      score += result.scores.overall_score * boost.popularity
    }

    return score
  }

  /**
   * Get reasons why this result matched the search
   */
  private getMatchReasons(
    result: any,
    queryTerms: string[],
    semanticTerms: Map<string, string[]>
  ): string[] {
    const reasons: string[] = []
    const text = {
      name: result.name.toLowerCase(),
      description: result.description.toLowerCase(),
      category: result.category?.name.toLowerCase() || '',
      tags: (result.tags || []).join(' ').toLowerCase()
    }

    queryTerms.forEach(term => {
      if (text.name.includes(term)) {
        reasons.push(`Name contains "${term}"`)
      }
      if (text.description.includes(term)) {
        reasons.push(`Description mentions "${term}"`)
      }
      if (text.category.includes(term)) {
        reasons.push(`Category matches "${term}"`)
      }
      if (text.tags.includes(term)) {
        reasons.push(`Tagged with "${term}"`)
      }
    })

    // Add semantic match reasons
    semanticTerms.forEach((related, term) => {
      related.forEach(relatedTerm => {
        if (text.name.includes(relatedTerm) || text.description.includes(relatedTerm)) {
          reasons.push(`Related to "${term}" (${relatedTerm})`)
        }
      })
    })

    return [...new Set(reasons)] // Remove duplicates
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(partialQuery: string): Promise<string[]> {
    const suggestions = [
      'React development tools',
      'Vue.js frameworks',
      'TypeScript utilities',
      'AI machine learning',
      'Database management',
      'API development',
      'Frontend frameworks',
      'Backend services',
      'Mobile app development',
      'Design systems',
      'Testing frameworks',
      'DevOps automation',
      'Analytics tracking',
      'Productivity tools'
    ]

    const query = partialQuery.toLowerCase()
    return suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query))
      .slice(0, 8)
  }

  /**
   * Get trending search terms
   */
  async getTrendingSearches(): Promise<string[]> {
    return [
      'AI tools',
      'React components',
      'TypeScript',
      'API testing',
      'Design systems',
      'Mobile development',
      'Database tools',
      'DevOps automation'
    ]
  }

  /**
   * Search with autocomplete
   */
  async searchWithAutocomplete(query: string, limit: number = 5): Promise<{
    results: SearchResult[]
    suggestions: string[]
    trending: string[]
  }> {
    const [results, suggestions, trending] = await Promise.all([
      this.search({ query, limit }),
      this.getSuggestions(query),
      this.getTrendingSearches()
    ])

    return { results, suggestions, trending }
  }
}

// Export singleton instance
export const advancedSearch = new AdvancedSearchService()
export type { SearchResult, SearchFilters, SemanticSearchOptions }
