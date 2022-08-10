/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {images: {unoptimized: true}},
  basePath: '/docs',
  reactStrictMode: true,
  swcMinify: true
}

module.exports = nextConfig
