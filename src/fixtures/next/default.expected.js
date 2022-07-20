/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {unoptimized: true},
  basePath: "/docs",
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig