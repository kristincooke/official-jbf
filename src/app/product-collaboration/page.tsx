'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ToolCard from '@/components/tool-card'
import { 
  Users, 
  Zap, 
  Star, 
  ExternalLink, 
  Github,
  Palette,
  Code,
  MessageSquare,
  BarChart3,
  Workflow,
  Brain,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface CollaborationTool {
  id: string
  name: string
  description: string
  website_url: string | null
  github_url: string | null
  pricing_model: string | null
  free_tier: boolean
  logo_url: string | null
  metadata: {
    tags: string[]
    features: string[]
    integrations: string[]
    target_users: string[]
  }
  scores?: {
    overall_score: number
  } | null
  reviews?: any[]
}

interface CategoryData {
  category: {
    id: string
    name: string
    description: string
    color_theme: string
  }
  tools: CollaborationTool[]
  statistics: {
    total_tools: number
    average_score: number
    total_reviews: number
    free_tools: number
    paid_tools: number
  }
}

export default function ProductCollaborationPage() {
  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'free' | 'paid' | 'ai-powered'>('all')

  useEffect(() => {
    fetchCollaborationTools()
  }, [])

  const fetchCollaborationTools = async () => {
    try {
      const response = await fetch('/api/seed/product-collaboration')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else if (response.status === 404) {
        // Category doesn't exist, we'll show a seed button
        setData(null)
      }
    } catch (error) {
      console.error('Failed to fetch collaboration tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const seedCollaborationTools = async () => {
    setSeeding(true)
    try {
      const response = await fetch('/api/seed/product-collaboration', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Seeding result:', result)
        // Refresh the data
        await fetchCollaborationTools()
      } else {
        console.error('Failed to seed tools')
      }
    } catch (error) {
      console.error('Seeding error:', error)
    } finally {
      setSeeding(false)
    }
  }

  const getFilteredTools = () => {
    if (!data) return []
    
    switch (selectedFilter) {
      case 'free':
        return data.tools.filter(tool => tool.free_tier)
      case 'paid':
        return data.tools.filter(tool => !tool.free_tier)
      case 'ai-powered':
        return data.tools.filter(tool => 
          tool.metadata.tags.some(tag => 
            tag.includes('ai') || tag.includes('AI') || tag.includes('artificial')
          )
        )
      default:
        return data.tools
    }
  }

  const getIntegrationBadges = (integrations: string[]) => {
    const priorityIntegrations = ['JIRA', 'Slack', 'Figma', 'GitHub', 'Notion', 'Confluence']
    const priority = integrations.filter(int => priorityIntegrations.includes(int))
    const others = integrations.filter(int => !priorityIntegrations.includes(int))
    
    return [...priority, ...others].slice(0, 4)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading collaboration tools...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Product Team Collaboration AI
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                AI-powered tools for fast-paced, high-fidelity collaboration and prototyping between 
                Product/Project managers, UX designers, and Engineers.
              </p>
            </div>

            <Card className="p-8">
              <CardContent>
                <Brain className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Explore Collaboration Tools?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We've curated a collection of the best AI-powered collaboration tools that integrate 
                  with JIRA, Confluence, and other planning tools to streamline your product development workflow.
                </p>
                <Button 
                  onClick={seedCollaborationTools}
                  disabled={seeding}
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {seeding ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                      Loading Tools...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Load Collaboration Tools
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const filteredTools = getFilteredTools()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: data.category.color_theme }}
            >
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {data.category.description}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.statistics.total_tools}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Tools
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(data.statistics.average_score * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Score
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.statistics.free_tools}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Free Tools
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.statistics.total_reviews}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Reviews
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              size="sm"
            >
              All Tools ({data.tools.length})
            </Button>
            <Button
              variant={selectedFilter === 'free' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('free')}
              size="sm"
            >
              Free ({data.statistics.free_tools})
            </Button>
            <Button
              variant={selectedFilter === 'paid' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('paid')}
              size="sm"
            >
              Paid ({data.statistics.paid_tools})
            </Button>
            <Button
              variant={selectedFilter === 'ai-powered' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('ai-powered')}
              size="sm"
            >
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {tool.logo_url ? (
                      <img 
                        src={tool.logo_url} 
                        alt={`${tool.name} logo`}
                        className="w-10 h-10 rounded-lg object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {tool.free_tier && (
                          <Badge variant="secondary" className="text-xs">
                            Free Tier
                          </Badge>
                        )}
                        {tool.metadata.tags.some(tag => tag.includes('ai')) && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            <Brain className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {tool.scores && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {(tool.scores.overall_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {tool.description}
                </p>

                {/* Target Users */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Users:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tool.metadata.target_users.slice(0, 3).map((user) => (
                      <Badge key={user} variant="outline" className="text-xs">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Key Integrations */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Key Integrations:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getIntegrationBadges(tool.metadata.integrations).map((integration) => (
                      <Badge key={integration} variant="secondary" className="text-xs">
                        {integration}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {tool.website_url && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </a>
                    </Button>
                  )}
                  {tool.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={tool.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Why These Tools Excel at Product Team Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">AI-Powered Intelligence</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smart suggestions, automated workflows, and intelligent content generation
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Workflow className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">JIRA Integration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Seamless integration with JIRA, Confluence, and project management tools
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Real-time Collaboration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Live editing, commenting, and feedback across design and development
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-medium mb-2">Design-to-Code</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automated handoff with specs, assets, and production-ready code
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="text-center">
          <CardContent className="p-8">
            <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Product Team Collaboration?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              These AI-powered tools are designed to streamline communication between product managers, 
              designers, and engineers while integrating seamlessly with your existing workflow.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/tools">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Explore All Tools
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/submit">
                  <Plus className="h-5 w-5 mr-2" />
                  Submit a Tool
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
