import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// For client-side usage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color_theme: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color_theme?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color_theme?: string | null
          created_at?: string
        }
      }
      tools: {
        Row: {
          id: string
          name: string
          description: string
          category_id: string | null
          website_url: string | null
          github_url: string | null
          pricing_model: string | null
          free_tier: boolean
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category_id?: string | null
          website_url?: string | null
          github_url?: string | null
          pricing_model?: string | null
          free_tier?: boolean
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category_id?: string | null
          website_url?: string | null
          github_url?: string | null
          pricing_model?: string | null
          free_tier?: boolean
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          tool_id: string
          user_id: string
          rating: number
          review_text: string | null
          pros: string | null
          cons: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tool_id: string
          user_id: string
          rating: number
          review_text?: string | null
          pros?: string | null
          cons?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tool_id?: string
          user_id?: string
          rating?: number
          review_text?: string | null
          pros?: string | null
          cons?: string | null
          created_at?: string
        }
      }
      tool_scores: {
        Row: {
          id: string
          tool_id: string
          accessibility_score: number
          performance_score: number
          innovation_score: number
          enterprise_score: number
          overall_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tool_id: string
          accessibility_score: number
          performance_score: number
          innovation_score: number
          enterprise_score: number
          overall_score: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tool_id?: string
          accessibility_score?: number
          performance_score?: number
          innovation_score?: number
          enterprise_score?: number
          overall_score?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
