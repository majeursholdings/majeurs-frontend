import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

/** Mirrors the live robots.txt rules (Rank Math, updated 26 Oct 2026). */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				disallow: [
					"/cart/",
					"/checkout/",
					"/my-account/",
					"/wishlist/",
					"/search/",
					"/*?currency=",
					"/*&currency=",
					"/*__rtsb_wpnonce=",
					"/*?s=",
					"/*add-to-cart=",
				],
			},
			{ userAgent: "Reflectionbot", disallow: ["/"] },
		],
		sitemap: `${SITE_URL}/sitemap_index.xml`,
	};
}
