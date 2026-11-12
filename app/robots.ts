import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

/**
 * Crawlers that collect content to train AI models. AI *search* and
 * user-triggered fetchers (OAI-SearchBot, ChatGPT-User, PerplexityBot,
 * Claude-SearchBot, Claude-User) stay allowed so products can still be
 * surfaced and linked in AI answers.
 */
const AI_TRAINING_BOTS = [
	"GPTBot",
	"CCBot",
	"Bytespider",
	"ClaudeBot",
	"anthropic-ai",
	"Google-Extended",
	"Applebot-Extended",
	"meta-externalagent",
	"cohere-ai",
	"cohere-training-data-crawler",
	"Diffbot",
	"ImagesiftBot",
	"Omgilibot",
	"Timpibot",
	"PanguBot",
	"AI2Bot",
];

/** Third-party SEO / backlink crawlers. */
const SEO_BOTS = [
	"AhrefsBot",
	"SemrushBot",
	"MJ12bot",
	"DotBot",
	"BLEXBot",
	"DataForSeoBot",
	"serpstatbot",
	"Barkrowler",
];

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
			{
				userAgent: ["Reflectionbot", ...AI_TRAINING_BOTS, ...SEO_BOTS],
				disallow: ["/"],
			},
		],
		sitemap: `${SITE_URL}/sitemap_index.xml`,
	};
}
