import {
	blogCategorySlugs,
	blogPostSlugs,
	productCategoryPaths,
	productSlugs,
	projectSlugs,
	staticPages,
} from "./wpRoutes";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://majeurs.com";

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

// TODO: build these lists from WordPress (with lastmod) once the data layer exists.
export const sitemaps: Record<string, () => string[]> = {
	page: () => staticPages.map((p) => p.path).filter((p) => !NOINDEX.has(p) && p !== "/shop/" && p !== "/project/"),
	post: () => ["/blog/", ...blogPostSlugs.map((s) => `/${s}/`)],
	product: () => ["/shop/", ...productSlugs.map((s) => `/product/${s}/`)],
	product_cat: () => productCategoryPaths.map((p) => `/product-category/${p}/`),
	category: () => blogCategorySlugs.map((s) => `/category/${s}/`),
	project: () => ["/project/", ...projectSlugs.map((s) => `/project/${s}/`)],
	local: () => ["/locations.kml"],
};

export function sitemapIndexXml(): string {
	const items = Object.keys(sitemaps)
		.map((name) => `\t<sitemap><loc>${SITE}/${name}-sitemap.xml</loc></sitemap>`)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

export function sitemapXml(name: string): string | null {
	const build = sitemaps[name];
	if (!build) return null;
	const items = build()
		.map((path) => `\t<url><loc>${SITE}${path}</loc></url>`)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

export const xmlResponse = (body: string) =>
	new Response(body, { headers: { "Content-Type": "application/xml; charset=UTF-8" } });
