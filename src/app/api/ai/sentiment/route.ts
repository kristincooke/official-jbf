import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, review_id, batch_analysis } = body

    if (!text && !batch_analysis) {
      return NextResponse.json(
        { error: 'text or batch_analysis is required' },
        { status: 400 }
      )
    }

    let results

    if (batch_analysis) {
      // Analyze multiple reviews at once
      const supabase = await createClient()
      
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, review_text, pros, cons')
        .not('review_text', 'is', null)
        .limit(batch_analysis.limit || 50)

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
      }

      results = await Promise.all(
        reviews.map(async (review) => {
          const fullText = [review.review_text, review.pros, review.cons]
            .filter(Boolean)
            .join(' ')
          
          const sentiment = await aiService.analyzeSentiment(fullText)
          
          return {
            review_id: review.id,
            sentiment
          }
        })
      )

      // Optionally store sentiment analysis results
      if (batch_analysis.store_results) {
        // You could create a sentiment_analysis table to store these results
        console.log('Storing sentiment analysis results:', results.length)
      }
    } else {
      // Analyze single text
      const sentiment = await aiService.analyzeSentiment(text)
      
      // Optionally store the result for a specific review
      if (review_id) {
        const supabase = await createClient()
        // You could update the review with sentiment data or store in separate table
        console.log(`Sentiment analysis for review ${review_id}:`, sentiment)
      }
      
      results = { sentiment }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('AI sentiment analysis API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('tool_id')
    const reviewId = searchParams.get('review_id')

    const supabase = await createClient()

    if (reviewId) {
      // Analyze specific review
      const { data: review, error } = await supabase
        .from('reviews')
        .select('review_text, pros, cons')
        .eq('id', reviewId)
        .single()

      if (error || !review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }

      const fullText = [review.review_text, review.pros, review.cons]
        .filter(Boolean)
        .join(' ')

      const sentiment = await aiService.analyzeSentiment(fullText)
      return NextResponse.json({ sentiment })
    }

    if (toolId) {
      // Analyze all reviews for a tool
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, review_text, pros, cons, rating')
        .eq('tool_id', toolId)
        .not('review_text', 'is', null)

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
      }

      const sentimentAnalysis = await Promise.all(
        reviews.map(async (review) => {
          const fullText = [review.review_text, review.pros, review.cons]
            .filter(Boolean)
            .join(' ')
          
          const sentiment = await aiService.analyzeSentiment(fullText)
          
          return {
            review_id: review.id,
            rating: review.rating,
            sentiment
          }
        })
      )

      // Calculate aggregate sentiment
      const avgSentimentScore = sentimentAnalysis.reduce((sum, item) => sum + item.sentiment.score, 0) / sentimentAnalysis.length
      const sentimentDistribution = {
        positive: sentimentAnalysis.filter(item => item.sentiment.sentiment === 'positive').length,
        neutral: sentimentAnalysis.filter(item => item.sentiment.sentiment === 'neutral').length,
        negative: sentimentAnalysis.filter(item => item.sentiment.sentiment === 'negative').length
      }

      const commonEmotions = sentimentAnalysis
        .flatMap(item => item.sentiment.emotions)
        .reduce((acc, emotion) => {
          acc[emotion] = (acc[emotion] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      return NextResponse.json({
        tool_sentiment: {
          average_score: avgSentimentScore,
          distribution: sentimentDistribution,
          common_emotions: commonEmotions,
          total_reviews: sentimentAnalysis.length
        },
        individual_analysis: sentimentAnalysis
      })
    }

    return NextResponse.json({ error: 'tool_id or review_id is required' }, { status: 400 })
  } catch (error) {
    console.error('AI sentiment analysis API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
