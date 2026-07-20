/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  typescript: {
    // TypeScript error থাকলেও বিল্ড থামাবে না
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint error থাকলেও বিল্ড থামাবে না
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;