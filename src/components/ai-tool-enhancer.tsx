'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react'

interface AIToolEnhancerProps {
  toolId?: string
  toolName: string
  currentDescription: string
  category?: string
  onDescriptionUpdate?: (newDescription: string) => void
}

export function AIToolEnhancer({
  toolId,
  toolName,
  currentDescription,
  category = 'Web Development',
  onDescriptionUpdate
}: AIToolEnhancerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [enhancedDescription, setEnhancedDescription] = useState('')
  const [prosAndCons, setProsAndCons] = useState<{
    pros: string[]
    cons: string[]
    summary: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'pros-cons'>('description')
  const [copied, setCopied] = useState(false)

  const enhanceDescription = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'enhance_description',
          tool_name: toolName,
          description: currentDescription,
          category,
          tool_id: toolId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setEnhancedDescription(data.result.content)
      }
    } catch (error) {
      console.error('Failed to enhance description:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateProsCons = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate_pros_cons',
          tool_name: toolName,
          description: currentDescription,
          category
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProsAndCons(data.result)
      }
    } catch (error) {
      console.error('Failed to generate pros/cons:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const acceptEnhancement = () => {
    if (enhancedDescription && onDescriptionUpdate) {
      onDescriptionUpdate(enhancedDescription)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Content Enhancement
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'description' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('description')}
          >
            Enhanced Description
          </Button>
          <Button
            variant={activeTab === 'pros-cons' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('pros-cons')}
          >
            Pros & Cons
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Description
              </label>
              <Textarea
                value={currentDescription}
                readOnly
                className="mt-1 bg-gray-50 dark:bg-gray-800"
                rows={3}
              />
            </div>

            <Button
              onClick={enhanceDescription}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enhancing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enhance Description
                </>
              )}
            </Button>

            {enhancedDescription && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI-Enhanced Description
                  </label>
                  <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {enhancedDescription}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={acceptEnhancement}
                    size="sm"
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Accept Enhancement
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(enhancedDescription)}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pros-cons' && (
          <div className="space-y-4">
            <Button
              onClick={generateProsCons}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Pros & Cons
                </>
              )}
            </Button>

            {prosAndCons && (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    Pros
                  </h4>
                  <ul className="space-y-1">
                    {prosAndCons.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Cons
                  </h4>
                  <ul className="space-y-1">
                    {prosAndCons.cons.map((con, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Summary
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {prosAndCons.summary}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
