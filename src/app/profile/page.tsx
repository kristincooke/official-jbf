'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Star, 
  MessageSquare, 
  Heart, 
  Calendar,
  Award,
  Bookmark,
  Settings,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import ToolCard from '@/components/tool-card'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  preferences: {
    categories: string[]
    experience_level: string
    use_cases: string[]
  }
  stats: {
    reviews_count: number
    tools_submitted: number
    collections_count: number
    avg_rating_given: number
  }
}

interface UserCollection {
  id: string
  name: string
  description: string
  is_public: boolean
  created_at: string
  tools: Array<{
    id: string
    name: string
    description: string
    website_url: string | null
    github_url: string | null
    pricing_model: string | null
    free_tier: boolean
    logo_url: string | null
    category: {
      name: string
      color_theme: string | null
    } | null
  }>
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [collections, setCollections] = useState<UserCollection[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    categories: [] as string[],
    experience_level: 'intermediate',
    use_cases: [] as string[]
  })

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchUserCollections()
      fetchRecentReviews()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      // Mock user profile data (would come from Supabase)
      const mockProfile: UserProfile = {
        id: user?.id || '',
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || null,
        bio: 'Passionate developer exploring the latest tools and technologies.',
        avatar_url: user?.user_metadata?.avatar_url || null,
        created_at: '2024-01-15T00:00:00Z',
        preferences: {
          categories: ['Web Development', 'AI Tools', 'Design Tools'],
          experience_level: 'intermediate',
          use_cases: ['development', 'productivity', 'design']
        },
        stats: {
          reviews_count: 12,
          tools_submitted: 3,
          collections_count: 2,
          avg_rating_given: 4.2
        }
      }

      setProfile(mockProfile)
      setEditForm({
        full_name: mockProfile.full_name || '',
        bio: mockProfile.bio || '',
        categories: mockProfile.preferences.categories,
        experience_level: mockProfile.preferences.experience_level,
        use_cases: mockProfile.preferences.use_cases
      })
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const fetchUserCollections = async () => {
    try {
      // Mock collections data
      const mockCollections: UserCollection[] = [
        {
          id: '1',
          name: 'My Favorite AI Tools',
          description: 'A curated list of AI tools I use daily',
          is_public: true,
          created_at: '2024-01-20T00:00:00Z',
          tools: []
        },
        {
          id: '2',
          name: 'Frontend Essentials',
          description: 'Must-have tools for frontend development',
          is_public: false,
          created_at: '2024-02-01T00:00:00Z',
          tools: []
        }
      ]

      setCollections(mockCollections)
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    }
  }

  const fetchRecentReviews = async () => {
    try {
      // Mock recent reviews
      const mockReviews = [
        {
          id: '1',
          rating: 5,
          review_text: 'Amazing tool for React development!',
          created_at: '2024-02-10T00:00:00Z',
          tool: { name: 'React DevTools', id: '1' }
        },
        {
          id: '2',
          rating: 4,
          review_text: 'Great for design systems, but has a learning curve.',
          created_at: '2024-02-08T00:00:00Z',
          tool: { name: 'Figma', id: '2' }
        }
      ]

      setRecentReviews(mockReviews)
    } catch (error) {
      console.error('Failed to fetch recent reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      // Would save to Supabase
      console.log('Saving profile:', editForm)
      
      if (profile) {
        setProfile({
          ...profile,
          full_name: editForm.full_name,
          bio: editForm.bio,
          preferences: {
            categories: editForm.categories,
            experience_level: editForm.experience_level,
            use_cases: editForm.use_cases
          }
        })
      }
      
      setEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Please sign in to view your profile
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile?.full_name || 'Anonymous User'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {profile?.email}
                    </p>
                    {!editing ? (
                      <p className="text-gray-700 dark:text-gray-300 max-w-md">
                        {profile?.bio || 'No bio provided'}
                      </p>
                    ) : (
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="max-w-md"
                        rows={3}
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={saveProfile} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        onClick={() => setEditing(false)} 
                        variant="outline" 
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {profile?.stats.reviews_count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Reviews
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile?.stats.tools_submitted}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tools Submitted
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile?.stats.collections_count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Collections
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {profile?.stats.avg_rating_given.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Rating
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Collections */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5" />
                    My Collections
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Collection
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collections.map((collection) => (
                    <div key={collection.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {collection.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {collection.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={collection.is_public ? "default" : "secondary"}>
                            {collection.is_public ? 'Public' : 'Private'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {collection.tools.length} tools • Created {new Date(collection.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {review.tool.name}
                          </h3>
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {review.review_text}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Favorite Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.preferences.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Experience Level
                  </h4>
                  <Badge variant="outline">
                    {profile?.preferences.experience_level}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Use Cases
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.preferences.use_cases.map((useCase) => (
                      <Badge key={useCase} variant="outline">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Since */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Member Since
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  {profile && new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
