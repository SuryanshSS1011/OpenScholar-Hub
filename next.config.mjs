/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds for better code quality
    dirs: ['pages', 'components', 'lib', 'utils', 'services', 'context', 'hooks', 'store'], // Only lint app code, not config files
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking during builds
  },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  
  // Optimize bundles - simplified for now
  webpack: (config, { dev, isServer }) => {
    // Basic configuration only
    return config;
  },
  
  // Experimental features
  experimental: {
    // Optimize CSS imports - disabled for now to fix build issues
    // optimizeCss: true,
  },
  
  // External packages for server components
  serverExternalPackages: ['@slack/bolt'],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
    ];
  },
  
  // Compress responses
  compress: true,
  
  // PoweredBy header
  poweredByHeader: false,
  
  // Trailing slash
  trailingSlash: false,
};

export default nextConfig;
