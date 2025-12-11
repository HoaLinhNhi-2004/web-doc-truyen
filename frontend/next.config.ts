import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, 
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // 👇 SỬA Ở ĐÂY: Trỏ về cổng 3000 (nơi Backend bạn đang chạy)
        destination: 'http://localhost:3000/api/:path*', 
      },
    ];
  },
};

export default nextConfig;