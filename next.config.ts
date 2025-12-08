import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Cho phép tất cả các trang web (dùng tạm khi dev)
      },
    ],
  },
};

export default nextConfig;