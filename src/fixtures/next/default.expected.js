/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {unoptimized: false},
  basePath: "/docs",
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig