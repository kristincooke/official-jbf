'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { BarChart3, Users, Wrench, TrendingUp, AlertCircle, CheckCircle, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalTools: number
  totalUsers: number
  totalReviews: number
  pendingTools: number
  averageRating: number
  toolsThisMonth: number
}

interface PendingTool {
  id: string
  name: string
  description: string
  website_url: string
  created_at: string
  category?: {
    name: string
  }
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingTools, setPendingTools] = useState<PendingTool[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'users' | 'analytics'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Fetch pending tools
      const toolsResponse = await fetch('/api/admin/pending-tools')
      if (toolsResponse.ok) {
        const toolsData = await toolsResponse.json()
        setPendingTools(toolsData.tools)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const approveTool = async (toolId: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setPendingTools(prev => prev.filter(tool => tool.id !== toolId))
        fetchDashboardData() // Refresh stats
      }
    } catch (error) {
      console.error('Error approving tool:', error)
    }
  }

  const rejectTool = async (toolId: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setPendingTools(prev => prev.filter(tool => tool.id !== toolId))
        fetchDashboardData() // Refresh stats
      }
    } catch (error) {
      console.error('Error rejecting tool:', error)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be signed in to access the admin dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage tools, users, and platform analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'tools', label: 'Tools', icon: Wrench },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 font-medium text-sm rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tools</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTools}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tools</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingTools}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating.toFixed(1)}</p>
                    </div>
                    <Star className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tools This Month</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.toolsThisMonth}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-indigo-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Pending Tools */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Tool Approvals
                </h3>
              </div>
              <div className="p-6">
                {pendingTools.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No pending tools to review
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingTools.map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{tool.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{tool.category?.name}</span>
                            <span>{new Date(tool.created_at).toLocaleDateString()}</span>
                            <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                              View Website
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => approveTool(tool.id)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectTool(tool.id)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'overview' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
