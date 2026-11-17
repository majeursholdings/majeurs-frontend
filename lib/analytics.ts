/**
 * Analytics events, sent to Google Analytics (gtag) and the Meta pixel. Both IDs are the ones the WP plugins
 * manage (Site Kit, Meta for WooCommerce); the tags load in components/analytics/analyticsTags.tsx and nothing
 * is sent while an ID is unset.
 *
 * Meta for WooCommerce also sends events from WordPress (Conversions API), so the pixel must not repeat them:
 * - AddToCart: WordPress sends it on every Store API add and returns its event ID in the cart response
 *   (`Cart.metaEvent`); the pixel reuses that ID, so Meta counts it once.
 * - Purchase: WordPress sends it when the order is created, with the billing details; the pixel doesn't.
 * - ViewContent and InitiateCheckout come from WP page templates the headless site never renders, so only the
 *   pixel sends them.
 */

/** Site Kit's Google tag, e.g. "GT-W6NJ7Q43" (WP Admin > Site Kit > Settings > Analytics) */
export const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
/**
 * Google tag gateway measurement path, served first-party by Cloudflare (Cloudflare > Tag Management), e.g. "/fdep".
 * Unset: gtag.js loads from googletagmanager.com.
 */
export const GOOGLE_TAG_GATEWAY = process.env.NEXT_PUBLIC_GOOGLE_TAG_GATEWAY?.replace(/\/$/, "") || undefined;
/** Meta for WooCommerce's pixel, e.g. "1576009817459750" (WP Admin > Marketing > Facebook) */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Hostnames that may send analytics, comma-separated (NEXT_PUBLIC_ANALYTICS_HOSTS). Default: the live site only, so
 * Vercel preview / *.vercel.app builds, localhost and majeurs.local never reach GA4 or the pixel (test orders on
 * majeurs-frontend.vercel.app were being recorded as real ones).
 */
export const ANALYTICS_HOSTS = (process.env.NEXT_PUBLIC_ANALYTICS_HOSTS || "majeurs.com,www.majeurs.com")
	.split(",")
	.map((h) => h.trim().toLowerCase())
	.filter(Boolean);

/**
 * Whether this page view may send analytics: an allowed hostname, and not a browser driven by automation
 * (Puppeteer, Playwright and Selenium set navigator.webdriver). The same check runs in the inline tag scripts
 * (components/analytics/analyticsTags.tsx), so a blocked page never loads gtag.js or fbevents.js at all.
 */
export function analyticsAllowed(): boolean {
	if (typeof window === "undefined") return false;
	return ANALYTICS_HOSTS.includes(window.location.hostname.toLowerCase()) && !navigator.webdriver;
}

/**
 * Forms whose confirmed submission is a sales lead: they also send GA4's recommended `generate_lead` event (a key
 * event), only after WordPress has accepted the enquiry. Newsletter and catalogue sign-ups have their own key events;
 * complaints and job applications aren't leads.
 */
export const LEAD_FORMS: ReadonlySet<TrackedFormName> = new Set<TrackedFormName>([
	"contact",
	"quote_request",
	"trade_program",
	"custom_order",
	"visitation",
	"furniture_repair",
	"waitlist",
]);

/**
 * Key events GA4 already counts, sent by GTM-5TL8FPQ2 (injected by Cloudflare's Google tag gateway) from page views of
 * old WordPress thank-you pages and an Elementor jQuery listener, neither of which tracks a confirmed submission on
 * this site. Sent from here once WordPress has accepted the form, so GTM can be retired (see
 * claude/weekly-report-fixes-2026-11-16.md in the project): pause its three GA4 event tags when this ships.
 */
export const SUCCESS_EVENTS: Partial<Record<TrackedFormName, SuccessEventName>> = {
	newsletter: "newsletter_signup_success",
	catalogue_request: "catalogue_download_success",
	quote_request: "quote_request_success",
};
type SuccessEventName = "newsletter_signup_success" | "catalogue_download_success" | "quote_request_success";

/** Forms whose start / submit we track (MainForm `trackingName`) */
export type TrackedFormName =
	| "newsletter"
	| "contact"
	| "trade_program"
	| "catalogue_request"
	| "custom_order"
	| "product_review"
	| "checkout"
	| "account_login"
	| "account_register"
	| "visitation"
	| "quote_request"
	| "furniture_repair"
	| "waitlist"
	| "academy_waitlist"
	| "complaint"
	| "job_application";

/** A GA4 e-commerce item; price is per unit, in major units (naira, not kobo) */
export type AnalyticsItem = { item_id: string; item_name: string; price: number; quantity: number; item_variant?: string };

/** An event Meta for WooCommerce already sent from WordPress (Store API `extensions["facebook-for-woocommerce"]`) */
export type MetaServerEvent = { event: string; params: Record<string, unknown> };

type Commerce = { currency: string; value: number; items: AnalyticsItem[] };

export type AnalyticsEvent =
	| { event: "form_start"; form_name: TrackedFormName }
	| { event: "form_submit"; form_name: TrackedFormName }
	| { event: "generate_lead"; form_name: TrackedFormName }
	| { event: SuccessEventName; form_name: TrackedFormName }
	| ({ event: "view_item" } & Commerce)
	| ({ event: "add_to_cart"; meta: MetaServerEvent | null } & Commerce)
	| ({ event: "begin_checkout" } & Commerce)
	| ({ event: "purchase"; transaction_id: string; tax: number; shipping: number } & Commerce)
	| { event: "add_to_wishlist"; product_id: number };

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
		fbq?: (...args: unknown[]) => void;
	}
}

export function trackEvent(event: AnalyticsEvent): void {
	if (!analyticsAllowed()) return;
	const params: Record<string, unknown> = { ...event };
	delete params.event;
	// for the pixel only
	delete params.meta;

	if (GOOGLE_TAG_ID) {
		window.dataLayer = window.dataLayer ?? [];
		// the standard gtag stub: events sent before gtag.js loads wait in the dataLayer
		window.gtag =
			window.gtag ??
			function gtag() {
				// eslint-disable-next-line prefer-rest-params -- gtag.js reads Arguments objects, not arrays
				window.dataLayer!.push(arguments);
			};
		window.gtag("event", event.event, params);
	}

	if (META_PIXEL_ID && window.fbq) {
		const pixel = toPixel(event);
		if (pixel) window.fbq("track", pixel.name, pixel.params, pixel.eventId ? { eventID: pixel.eventId } : undefined);
	}
}

function toPixel(event: AnalyticsEvent): { name: string; params: Record<string, unknown>; eventId?: string } | null {
	const products = (e: Commerce) => ({
		content_type: "product",
		content_ids: e.items.map((i) => i.item_id),
		contents: e.items.map((i) => ({ id: i.item_id, quantity: i.quantity })),
		num_items: e.items.reduce((n, i) => n + i.quantity, 0),
		value: e.value,
		currency: e.currency,
	});

	switch (event.event) {
		case "view_item":
			return { name: "ViewContent", params: { ...products(event), content_name: event.items[0]?.item_name } };
		case "add_to_cart": {
			if (!event.meta) return { name: "AddToCart", params: products(event) };
			// WordPress sends content_ids and contents as JSON strings
			const { event_id, ...rest } = event.meta.params;
			const params = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, typeof v === "string" && /^[[{]/.test(v) ? safeJson(v) : v]));
			return { name: event.meta.event, params, eventId: typeof event_id === "string" ? event_id : undefined };
		}
		case "begin_checkout":
			return { name: "InitiateCheckout", params: products(event) };
		case "add_to_wishlist":
			return { name: "AddToWishlist", params: { content_ids: [String(event.product_id)], content_type: "product" } };
		default:
			// purchase is sent by Meta for WooCommerce from WordPress; forms stay GA-only, as on the WP site
			return null;
	}
}

function safeJson(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}
