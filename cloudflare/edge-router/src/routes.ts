/**
 * Which majeurs.com paths Next.js answers. Everything else stays on WordPress. Shared by the Worker
 * (src/index.ts) and its Cloudflare routes (cloudflare.config.ts), so the two can't drift apart.
 *
 * Groups go live together or in order: "commerce" needs "shop". While WordPress renders the product pages, its
 * "Add to cart" fills WooCommerce's session cart, which the Next.js cart (Store API Cart-Token) never sees.
 */

/** A path prefix ending in "/" (also matches the path without it), or an exact path */
export type PathRule = { prefix: string } | { exact: string };

export const GROUPS = {
	/** Next.js itself: build assets, route handlers, public files and icons. Always on. */
	next: [{ prefix: "/_next/" }, { prefix: "/api/" }, { prefix: "/font/" }, { prefix: "/images/" }, { exact: "/icon.png" }, { exact: "/apple-icon.png" }],
	/** Phase 1: home, shop, categories, tags, products, search */
	shop: [{ exact: "/" }, { prefix: "/shop/" }, { prefix: "/product/" }, { prefix: "/product-category/" }, { prefix: "/product-tag/" }, { prefix: "/search/" }],
	/** Phase 3 + 4: cart, checkout (incl. order-received and order-pay), My account, wishlist */
	commerce: [{ prefix: "/cart/" }, { prefix: "/checkout/" }, { prefix: "/my-account/" }, { prefix: "/wishlist/" }],
} satisfies Record<string, PathRule[]>;

export type Group = keyof typeof GROUPS;

/** The groups switched on. Edit, then `npm run deploy:dry` and `npm run deploy`. */
export const LIVE_GROUPS: Group[] = ["next", "shop", "commerce"];

export const HOSTS = ["majeurs.com"];

export function rulesFor(groups: Group[]): PathRule[] {
	return groups.flatMap((g) => GROUPS[g]);
}

/** Cloudflare route patterns that send these paths to the Worker (trailing "*" only; the Worker filters the rest) */
export function routePatterns(groups: Group[], hosts = HOSTS): string[] {
	const paths = rulesFor(groups).map((r) => ("exact" in r ? r.exact : `${r.prefix.slice(0, -1)}*`));
	return hosts.flatMap((h) => paths.map((p) => `${h}${p}`));
}

/**
 * Requests that must reach WordPress even on a Next.js path, uncached and untouched:
 * - payment callbacks and webhooks: any path with /wc-api/ and any wc-api= query (Paystack, Stripe)
 * - WooCommerce AJAX: ?wc-ajax= on any path (Stripe's order-status update, called by the Next.js server too)
 * - Stripe's redirect-based returns, which WordPress settles before redirecting to the clean URL
 */
export function mustStayOnWordPress(url: URL): boolean {
	if (url.pathname.includes("/wc-api/") || url.searchParams.has("wc-api") || url.searchParams.has("wc-ajax")) return true;
	return url.pathname.startsWith("/checkout/order-received/") && url.searchParams.get("wc_payment_method") === "stripe";
}

export function isNextPath(pathname: string, rules: PathRule[]): boolean {
	return rules.some((r) => ("exact" in r ? pathname === r.exact : pathname.startsWith(r.prefix) || pathname === r.prefix.slice(0, -1)));
}
