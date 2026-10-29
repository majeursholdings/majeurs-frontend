/** WordPress origin. Point at cms.majeurs.com once WP moves behind the headless front. */
export const WP_URL = process.env.WP_URL ?? "https://majeurs.com";

export const STORE_API = `${WP_URL}/wp-json/wc/store/v1`;
export const WP_API = `${WP_URL}/wp-json/wp/v2`;

/** WP returns titles and names HTML-encoded ("Amara &#8211; The …") */
export function decodeEntities(value: string): string {
	return value
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#039;|&apos;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">");
}
