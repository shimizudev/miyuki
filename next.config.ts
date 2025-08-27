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
      {
        hostname: "media.kitsu.app",
      },
      {
        hostname: "anime.delivery",
      },
      {
        hostname: "image.tmdb.org",
      },
      {
        hostname: "seiryuu.vid-cdn.xyz",
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
