import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
       remotePatterns: [
        {
          hostname: "s4.anilist.co"
        }
       ]
    }
};

export default nextConfig;
