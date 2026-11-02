import { cacheLife, cacheTag } from "next/cache";
import {
	blogCategorySlugs,
	blogPostSlugs,
	productCategoryPaths,
	productSlugs,
	projectSlugs,
	staticPages,
} from "./wpRoutes";
import { WP_URL, wpFetch } from "@/lib/api/wp";
import { SITE_URL } from "@/lib/contact";

/** Same sitemap file names as Rank Math, so the URLs submitted in Search Console keep working. */
const NOINDEX = new Set([
	"/search/",
	"/cart/",
	"/checkout/",
	"/my-account/",
	"/wishlist/",
	"/catalogue/check-your-inbox-for-catalogue/",
	"/majeurs-trade-program/majeurs-trade-program-registration-completed/",
	"/get-a-quote-for-custom-made-furniture-in-lagos/quote-request-received/",
]);

/** Academy and Careers sub-pages move to their own portals; WP's career-sitemap is left out entirely */
const EXCLUDED = (path: string) =>
	NOINDEX.has(path) || /^\/majeurs-furniture-academy\/.+/.test(path) || path === "/product-category/uncategorized/";

/** Pages Next.js routes; a page published in WP without a route here stays out of the sitemap */
const ROUTED_PAGES = new Set(staticPages.map((p) => p.path));

/** Fallback lists, used when WP's sitemap can't be read */
const fallback: Record<string, () => string[]> = {
	page: () => staticPages.map((p) => p.path).filter((p) => !NOINDEX.has(p) && p !== "/shop/" && p !== "/project/"),
	post: () => ["/blog/", ...blogPostSlugs.map((s) => `/${s}/`)],
	product: () => ["/shop/", ...productSlugs.map((s) => `/product/${s}/`)],
	product_cat: () => productCategoryPaths.map((p) => `/product-category/${p}/`),
	category: () => blogCategorySlugs.map((s) => `/category/${s}/`),
	project: () => ["/project/", ...projectSlugs.map((s) => `/project/${s}/`)],
};

const SITEMAPS = [...Object.keys(fallback), "local"];

type Entry = { path: string; lastmod?: string; images: string[] };

const tag = (block: string, name: string) => block.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([^<\\]]+)`))?.[1]?.trim();

/** Rank Math's `<name>-sitemap.xml` from WP, as site paths with lastmod and image URLs */
async function wpSitemap(name: string): Promise<Entry[] | null> {
	"use cache";
	cacheLife("hours");
	cacheTag("sitemap");

	try {
		const res = await wpFetch(`${WP_URL}/${name}-sitemap.xml`);
		if (!res.ok) return null;
		const xml = await res.text();
		return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].flatMap(([, block]) => {
			const loc = tag(block, "loc");
			if (!loc) return [];
			const images = [...block.matchAll(/<image:loc>(?:<!\[CDATA\[)?([^<\]]+)/g)].map((m) => m[1].trim());
			return [{ path: new URL(loc).pathname, lastmod: tag(block, "lastmod"), images }];
		});
	} catch {
		return null;
	}
}

async function entries(name: string): Promise<Entry[]> {
	const fromWp = await wpSitemap(name);
	if (!fromWp) return fallback[name]().map((path) => ({ path, images: [] }));
	return fromWp.filter(({ path }) => !EXCLUDED(path) && (name !== "page" || (ROUTED_PAGES.has(path) && path !== "/shop/")));
}

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sitemapIndexXml(): string {
	const items = SITEMAPS.map((name) => `\t<sitemap><loc>${SITE_URL}/${name}-sitemap.xml</loc></sitemap>`).join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

/** Built from WP's sitemap of the same name (cached an hour, tag "sitemap"), re-hosted on SITE_URL */
export async function sitemapXml(name: string): Promise<string | null> {
	if (name === "local") return urlset([{ path: "/locations.kml", images: [] }]);
	if (!(name in fallback)) return null;
	return urlset(await entries(name));
}

function urlset(list: Entry[]): string {
	const items = list
		.map(({ path, lastmod, images }) => {
			const parts = [`<loc>${escapeXml(SITE_URL + path)}</loc>`];
			if (lastmod) parts.push(`<lastmod>${lastmod}</lastmod>`);
			for (const img of images) parts.push(`<image:image><image:loc>${escapeXml(img)}</image:loc></image:image>`);
			return `\t<url>${parts.join("")}</url>`;
		})
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${items}\n</urlset>\n`;
}

export const xmlResponse = (body: string) =>
	new Response(body, { headers: { "Content-Type": "application/xml; charset=UTF-8" } });
