import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/routes/wpRoutes";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Extra hostnames the dev server answers besides localhost, e.g. majeurs.local from the local proxy.
  // Set only in your own .env
  allowedDevOrigins: (process.env.DEV_ORIGINS ?? "").split(",").map((host) => host.trim()).filter(Boolean),
  partialPrefetching: true,
  experimental: {
    // enquiry forms send up to 4 files of 5MB each through submitEnquiryAction (lib/forms/submit.ts)
    // majeurs.com reaches Vercel through the Cloudflare edge router (cloudflare/edge-router), so Server Actions see
    // the vercel.app host; accept the public domain as the origin
    serverActions: { bodySizeLimit: "21mb", allowedOrigins: ["majeurs.com"] },
  },
  // WordPress URLs all end in "/" (e.g. /shop/, /product/<slug>/). Keep them identical.
  trailingSlash: true,
  images: {
    // Product and page images still live in WordPress uploads
    remotePatterns: [
      { protocol: "https", hostname: "majeurs.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "cms.majeurs.com", pathname: "/wp-content/uploads/**" },
      // staging WP
      { protocol: "https", hostname: "api.majeurs.com", pathname: "/wp-content/uploads/**" },
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // no other site may frame these pages (clickjacking); Stripe's card fields are frames *inside* them, so unaffected
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // isolates the window from pages it opens, but keeps popups (payment, social sharing) working
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS is set by Cloudflare (SSL/TLS > Edge Certificates); a second header here would be ignored
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Keep Rank Math's sitemap file names (submitted in Search Console)
      { source: "/:name-sitemap.xml", destination: "/sitemaps/:name" },
    ];
  },
};

export default nextConfig;
