/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 外部画像ドメインは使用しない方針
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
