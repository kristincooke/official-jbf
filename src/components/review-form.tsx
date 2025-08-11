'use client'

import { useState } from 'react'
import { Star, Send } from 'lucide-react'
import { useAuth } from './auth-provider'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  toolId: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ toolId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool_id: toolId,
          rating,
          review_text: reviewText,
          pros,
          cons
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit review')
      }

      setSuccess(true)
      setRating(0)
      setReviewText('')
      setPros('')
      setCons('')
      onReviewSubmitted?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to leave a review
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <p className="text-green-700 dark:text-green-400 font-medium">
          Thank you for your review! It has been submitted successfully.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Write a Review
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating *
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={cn(
                    'h-6 w-6',
                    (hoverRating || rating) >= star
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Review
          </label>
          <textarea
            id="review_text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Share your experience with this tool..."
          />
        </div>

        {/* Pros */}
        <div>
          <label htmlFor="pros" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pros
          </label>
          <textarea
            id="pros"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="What did you like about this tool?"
          />
        </div>

        {/* Cons */}
        <div>
          <label htmlFor="cons" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cons
          </label>
          <textarea
            id="cons"
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="What could be improved?"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={cn(
            "w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg transition-all duration-200",
            isSubmitting || rating === 0
              ? "opacity-50 cursor-not-allowed" 
              : "hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
          )}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default ReviewForm
