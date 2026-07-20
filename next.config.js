/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Static Export বা Prerender-এর সময় API কল বন্ধ রাখার সমাধান
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;