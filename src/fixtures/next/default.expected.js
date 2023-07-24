/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: { images: { unoptimized: true } },
  output: 'export',
  basePath: '/docs',
  reactStrictMode: true,
  swcMinify: true
}

module.exports = nextConfig
