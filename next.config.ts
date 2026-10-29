import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/routes/wpRoutes";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // enquiry forms send up to 4 files of 5MB each through submitEnquiryAction (lib/forms/submit.ts)
    serverActions: { bodySizeLimit: "21mb" },
  },
  // WordPress URLs all end in "/" (e.g. /shop/, /product/<slug>/). Keep them identical.
  trailingSlash: true,
  images: {
    // Product and page images still live in WordPress uploads
    remotePatterns: [
      { protocol: "https", hostname: "majeurs.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "cms.majeurs.com", pathname: "/wp-content/uploads/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    // Old WP URLs (Rank Math redirections + rebuild decisions). Source of truth: lib/routes/wpRoutes.ts
    return legacyRedirects.map(({ source, destination, permanent }) => ({ source, destination, permanent }));
  },
  async rewrites() {
    return [
      // Keep Rank Math's sitemap file names (submitted in Search Console)
      { source: "/:name-sitemap.xml", destination: "/sitemaps/:name" },
    ];
  },
};

export default nextConfig;
