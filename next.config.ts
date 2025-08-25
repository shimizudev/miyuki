import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "s4.anilist.co",
      },
      {
        hostname: "artworks.thetvdb.com",
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
