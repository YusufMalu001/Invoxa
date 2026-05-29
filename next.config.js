/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  output: 'standalone',
}

module.exports = nextConfig
