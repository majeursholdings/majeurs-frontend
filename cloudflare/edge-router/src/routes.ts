/**
 * Which majeurs.com requests stay on WordPress. Everything else is answered by Next.js. Shared by the Worker
 * (src/index.ts) and its Cloudflare route (cloudflare.config.ts).
 *
 * WordPress keeps the majeurs.com domain as the backend: wp-admin, the REST API the Next.js server calls, media,
 * and the payment callbacks. Its theme pages are no longer served; Next.js has a route, redirect or 410 for
 * every public URL (lib/routes/wpRoutes.ts, npm run check:routes in the Next.js project).
 */

export const HOSTS = ["majeurs.com"];

/** Path prefixes WordPress answers. Each also matches the path without its trailing slash. */
const WP_PREFIXES = [
	"/wp-admin/", // wp-admin, admin-ajax.php
	"/wp-json/", // REST API: Store API, content, account, forms, Rank Math, plugin webhooks
	"/wp-content/", // uploads, plugin and theme assets
	"/wp-includes/",
	"/.well-known/", // e.g. Apple Pay domain verification from the Stripe plugin
];

/** WordPress's own entry points at the root: wp-login.php, wp-cron.php, wp-comments-post.php, xmlrpc.php … */
const WP_ROOT_PHP = /^\/(wp-[a-z-]+|xmlrpc)\.php$/;

/** Query parameters that WordPress answers on any path */
const WP_QUERY = [
	"wc-api", // payment webhooks (Stripe ?wc-api=wc_stripe)
	"wc-ajax", // WooCommerce AJAX (Stripe's 3-D Secure order-status update, also called by the Next.js server)
	"rest_route", // the REST API without pretty permalinks
];

export function staysOnWordPress(url: URL): boolean {
	// "//wp-json/…" (a WP_URL with a trailing slash) is still WordPress's: WordPress treats repeated slashes as one
	const path = url.pathname.replace(/\/{2,}/g, "/");
	if (WP_PREFIXES.some((p) => path.startsWith(p) || path === p.slice(0, -1))) return true;
	if (WP_ROOT_PHP.test(path)) return true;
	// Paystack's callback and webhook (/wc-api/WC_Gateway_Paystack/), on any path
	if (path.includes("/wc-api/")) return true;
	if (WP_QUERY.some((q) => url.searchParams.has(q))) return true;
	// Stripe's redirect-based returns, which WordPress settles before redirecting to the clean URL
	return path.startsWith("/checkout/order-received/") && url.searchParams.get("wc_payment_method") === "stripe";
}

/** The Cloudflare route: every path on each host. The Worker passes WordPress's requests on untouched. */
export function routePatterns(hosts = HOSTS): string[] {
	return hosts.map((h) => `${h}/*`);
}
