/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['uploadthing.com', 'utfs.io']
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  }
};

module.exports = nextConfig;