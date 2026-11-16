import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const backendBase = backendUrl.endsWith("/api") 
  ? backendUrl.slice(0, -4) 
  : backendUrl.endsWith("/") 
    ? backendUrl.slice(0, -1) 
    : backendUrl;

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "carrentapp-six.vercel.app",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/cars/:path*',
        destination: `${backendBase}/uploads/cars/:path*`,
      },
    ];
  },
};

export default nextConfig;
