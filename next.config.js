/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    domains: ['cdn.worldvectorlogo.com', 'supabase.com', 'github.com'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig
