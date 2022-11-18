/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: { images: { unoptimized: true } },
  basePath: '/docs',
  reactStrictMode: true,
  swcMinify: true
}

export default nextConfig
