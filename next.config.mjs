/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['media.giphy.com', 'i.ytimg.com', 'img.youtube.com', 'openweathermap.org'],
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
