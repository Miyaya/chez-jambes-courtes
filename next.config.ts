import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // production
        protocol: "https",
        hostname: "lfyyvedsgztimpmgmcau.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // staging
        protocol: "https",
        hostname: "wmrcmztfbbdyigsopjcw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
