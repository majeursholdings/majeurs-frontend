/**
 * Analytics events, pushed to the GTM dataLayer. Nothing is sent until a tag manager is installed;
 * consent is handled by the tag manager (components/consent).
 * TODO: install GTM / GA4 to match the WP site (Site Kit) and wire consent mode.
 */

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
	| "complaint"
	| "job_application";

export type AnalyticsEvent =
	| { event: "form_start"; form_name: TrackedFormName }
	| { event: "form_submit"; form_name: TrackedFormName }
	| { event: "add_to_cart"; product_id: number }
	| { event: "add_to_wishlist"; product_id: number };

declare global {
	interface Window {
		dataLayer?: Record<string, unknown>[];
	}
}

export function trackEvent(event: AnalyticsEvent): void {
	if (typeof window === "undefined") return;
	window.dataLayer = window.dataLayer ?? [];
	window.dataLayer.push(event);
}
