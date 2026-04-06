import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl.replace(/\/+$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
