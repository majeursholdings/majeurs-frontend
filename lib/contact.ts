import type { Cart } from "@/lib/api/cart";

/**
 * Phone, WhatsApp, email and social accounts. Edited in wp-admin > Site content > Contact details
 * (lib/content/site.ts contactDetailsContent); server code reads them with getContact() (lib/content/get.ts),
 * client components with useContact() (components/providers/contactProvider.tsx).
 */
export type Contact = {
	phone: { label: string; href: string };
	/** digits only, as wa.me wants them */
	whatsapp: string;
	email: string;
	socials: SocialAccount[];
};

export type SocialIcon = "facebook" | "instagram" | "linkedin" | "tiktok" | "x" | "youtube";
export type SocialAccount = { label: string; href: string; icon: SocialIcon | null };

const SOCIAL_ICONS: Record<string, SocialIcon> = { facebook: "facebook", instagram: "instagram", linkedin: "linkedin", tiktok: "tiktok", x: "x", twitter: "x", youtube: "youtube" };

/** The Contact details fields as entered in wp-admin -> what the site uses */
export function toContact(values: { phone: string; whatsapp: string; email: string; socials: { network: string; url: string }[] }): Contact {
	const phone = values.phone.trim();
	return {
		phone: { label: phone, href: `tel:+${digits(phone)}` },
		whatsapp: digits(values.whatsapp) || digits(phone),
		email: values.email.trim(),
		socials: values.socials
			.filter((s) => s.network.trim() && s.url.trim())
			.map((s) => ({ label: s.network.trim(), href: s.url.trim(), icon: SOCIAL_ICONS[s.network.trim().toLowerCase()] ?? null })),
	};
}

/** "+234 814 399 8290" or "0814 399 8290" -> "2348143998290" (a leading 0 is read as a Nigerian number) */
function digits(number: string): string {
	const d = number.replace(/\D/g, "");
	return d.startsWith("0") ? `234${d.slice(1)}` : d;
}

/**
 * Placeholders editors can use in page copy (and, through majeurs-content.php, in the WooCommerce order emails), so
 * the number and address live in one place. Rich text may store them URL-encoded inside a link (%7Bemail%7D).
 */
export function fillContactTokens(text: string, contact: Contact): string {
	if (!text.includes("{") && !text.includes("%7B")) return text;
	const tokens: Record<string, string> = {
		phone: contact.phone.label,
		phone_link: contact.phone.href,
		whatsapp_link: whatsappLink(contact.whatsapp),
		email: contact.email,
	};
	return text.replace(/(?:\{|%7B)(phone|phone_link|whatsapp_link|email)(?:\}|%7D)/gi, (_, name: string) => tokens[name.toLowerCase()]);
}

/** How long a made-to-order piece takes to make, per product (also in the WooCommerce order emails) */
export const PRODUCTION_TIME = "6 to 10 weeks";

/** wa.me link to `number` (digits, Contact.whatsapp), optionally with a pre-filled message */
export function whatsappLink(number: string, text?: string): string {
	return text ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : `https://wa.me/${number}`;
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
