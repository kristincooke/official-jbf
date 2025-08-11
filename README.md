# JuiceBox Factory

<!-- Force Vercel re-detection --> 🚀

The definitive platform for discovering, comparing, and reviewing top-tier development tools. Like "Product Hunt meets Stack Overflow for dev tools."

**🔥 Now with Product Team Collaboration AI tools and live Supabase database!**

## 🌟 Features

- **Smart Tool Discovery**: Browse and search through curated developer tools
- **Intelligent Scoring**: Automated scoring system based on accessibility, performance, innovation, and enterprise readiness
- **Community Reviews**: Real reviews from real developers
- **Category Filtering**: Organized by tool categories (Animation, AI/ML, No-Code, etc.)
- **Modern UI**: Clean, responsive design with dark mode support
- **Tool Submission**: Easy form for submitting new tools to the platform

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd juicebox-factory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file and add your Supabase credentials
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── submit/            # Tool submission page
│   ├── tools/             # Tools listing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── navigation.tsx     # Main navigation
│   └── tool-card.tsx      # Tool display card
└── lib/                   # Utility functions
    ├── supabase.ts        # Supabase client & types
    └── utils.ts           # Helper functions
```

## 🗄 Database Schema

The application uses the following main tables:

- **categories**: Tool categories with color themes
- **tools**: Main tools data with metadata
- **reviews**: User reviews and ratings
- **tool_scores**: Automated scoring metrics

See `supabase/schema.sql` for the complete schema.

## 🎨 Design System

The UI follows a modern, clean design inspired by Linear and Vercel:

- **Colors**: Purple/blue gradient primary, semantic colors for categories
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Reusable, accessible components with consistent styling
- **Dark Mode**: Full dark mode support throughout the application

## 🚧 Current Status (Phase 1 Complete)

✅ **Completed:**
- Next.js project setup with TypeScript and Tailwind
- Database schema design and Supabase configuration
- Core UI components (Navigation, Tool Cards)
- Tool submission form with validation
- Tools listing page with search and filtering
- Responsive design with dark mode support

🔄 **Next Steps (Phase 2):**
- Supabase integration and CRUD operations
- User authentication system
- Review and rating functionality
- Admin dashboard
- Automated tool scoring algorithm

## 🤝 Contributing

This project is currently in development. Contributions will be welcome once the core functionality is complete.

## 📄 License

This project is licensed under the MIT License.
