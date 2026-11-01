import type { Cart } from "@/lib/api/cart";

/** Majeurs sales WhatsApp (same number as the WP "Buy on WhatsApp" button) */
export const WHATSAPP_NUMBER = "2348143998290";

/** Customer service, as listed on the WP policy pages */
export const CUSTOMER_SERVICE_EMAIL = "customerservice@majeursholdings.com";
export const CUSTOMER_SERVICE_PHONE = { label: "+234 201 330 6192", href: "tel:+2342013306192" };

/** How long a made-to-order piece takes to make, per product (also in the WooCommerce order emails) */
export const PRODUCTION_TIME = "6 to 10 weeks";

/** wa.me link, optionally with a pre-filled message */
export function whatsappLink(text?: string): string {
	return text ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}` : `https://wa.me/${WHATSAPP_NUMBER}`;
}

/** "Order via WhatsApp" message for the cart: each line with its options, quantity and total, then the cart total */
export function cartOrderMessage(cart: Pick<Cart, "items" | "coupons" | "total">): string {
	const lines = cart.items.map((item, i) =>
		[`${i + 1}. ${item.name}`, ...item.options.map((o) => `   ${o}`), `   Quantity: ${item.quantity}, ${item.lineTotal}`, `   ${SITE_URL}${item.href}`].join("\n"),
	);
	const coupons = cart.coupons.map((c) => `Coupon: ${c.code} (−${c.discount})`);
	return ["Hello Majeurs, I'd like to order:", "", lines.join("\n\n"), "", ...coupons, `Total: ${cart.total}`].join("\n");
}

/** This site's origin, for canonicals, sitemaps and JSON-LD. No trailing slash, so `${SITE_URL}/path/` never doubles it */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://majeurs.com").replace(/\/+$/, "");
