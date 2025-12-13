import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // 👇 QUAN TRỌNG: Dùng 127.0.0.1 thay vì localhost để tránh lỗi socket hang up trên Windows
        // 👇 QUAN TRỌNG: Trỏ về cổng 5000 (nơi Backend đang chạy)
        destination: 'http://127.0.0.1:5000/api/:path*', 
      },
    ];
  },
};

export default nextConfig;