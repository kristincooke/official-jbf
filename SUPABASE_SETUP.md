# Supabase Configuration

This project uses Supabase as the backend database and authentication provider.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wnozfsrbbpfdkpzpzppi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indub3pmc3JiYnBmZGtwenB6cHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODEyMTIsImV4cCI6MjA3MDQ1NzIxMn0.09g8VFyhez-60_X3ne6yuY0diFD_kPlabsJQREfXkBI

# Optional: OpenAI API Key for AI features
OPENAI_API_KEY=your_openai_api_key_here

# Optional: GitHub Token for external integrations
GITHUB_TOKEN=your_github_token_here
```

## Database Setup

The database schema is located in `supabase/schema.sql`. To set up your Supabase database:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/wnozfsrbbpfdkpzpzppi
2. Navigate to the SQL Editor
3. Run the SQL commands from `supabase/schema.sql` to create all necessary tables
4. Enable Row Level Security (RLS) policies as defined in the schema

## Features Requiring Supabase

- **User Authentication**: Sign up, sign in, user sessions
- **Tool Management**: CRUD operations for developer tools
- **Categories**: Tool categorization system
- **Reviews & Ratings**: User feedback system
- **User Profiles**: Personal user data and preferences
- **Collections**: User-curated tool collections
- **Notifications**: Real-time user notifications
- **Analytics**: Platform usage and performance metrics

## Client Configuration

The Supabase client is configured in:
- `src/lib/supabase.ts` - Browser client for client-side operations
- `src/lib/supabase-server.ts` - Server client for SSR and API routes

Both files include fallback credentials for development, but production should use environment variables.

## Authentication Flow

The platform uses Supabase Auth with:
- Email/password authentication
- Social login providers (configurable in Supabase dashboard)
- Protected routes and API endpoints
- User session management with cookies

## Development Notes

- The platform includes demo/fallback data for development without a full Supabase setup
- All API routes include proper error handling for missing Supabase connections
- Database types are defined in `src/lib/supabase.ts` for TypeScript support
