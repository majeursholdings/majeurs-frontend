import type { Cart } from "@/lib/api/cart";

/** Majeurs sales WhatsApp (same number as the WP "Buy on WhatsApp" button) */
export const WHATSAPP_NUMBER = "2348143998290";

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

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://majeurs.com";
