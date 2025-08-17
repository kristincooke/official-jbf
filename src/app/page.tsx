'use client'

import { BuilderComponent, builder } from '@builder.io/react'
import { useEffect, useState } from 'react'

// Initialize Builder.io
builder.init('5e91a1bc62a048c380f423d7cde034e0')

export default function Home() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the page content from Builder.io
    builder
      .get('page', {
        url: '/', // This fetches the home page content
      })
      .promise()
      .then((content) => {
        setContent(content)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching Builder.io content:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your JuiceBox Factory...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h1>
          <p className="text-gray-600">
            No content found in Builder.io for this page. Please check your Builder.io setup.
          </p>
        </div>
      </div>
    )
  }

  return (
    <BuilderComponent 
      model="page" 
      content={content}
    />
  )
}
