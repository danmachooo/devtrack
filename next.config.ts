import type { NextConfig } from "next";

const envApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function createApiRewriteDestination(apiBaseUrl: string) {
  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");
  return `${normalizedBaseUrl}/:path*`;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!envApiBaseUrl || !/^https?:\/\//i.test(envApiBaseUrl)) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: createApiRewriteDestination(envApiBaseUrl),
      },
    ];
  },
};

export default nextConfig;
