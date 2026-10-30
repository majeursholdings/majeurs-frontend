/** WordPress origin. Point at cms.majeurs.com once WP moves behind the headless front. */
export const WP_URL = process.env.WP_URL ?? "https://majeurs.com";

export const STORE_API = `${WP_URL}/wp-json/wc/store/v1`;
export const WP_API = `${WP_URL}/wp-json/wp/v2`;

/** A failed WP or Store API call. `label` names the endpoint, e.g. "Store API /products?slug=osisi" */
export class WpError extends Error {
	// a plain field, not a constructor parameter property: Node's type stripping (scripts/content.mts) can't run those
	readonly status: number;
	constructor(status: number, label: string) {
		super(`${label} answered ${status}`);
		this.name = "WpError";
		this.status = status;
	}
}

const TIMEOUT_MS = 10_000;
/** Retries for reads that fail with a network error, a timeout or a 5xx (WP drops requests under build load) */
const RETRIES = 2;
/** Parallel WP requests per server process. A build prerenders hundreds of pages and staging answers 500 past ~10. */
const MAX_CONCURRENT = Number(process.env.WP_MAX_CONCURRENCY) || 6;

let active = 0;
const queue: (() => void)[] = [];

async function withSlot<T>(run: () => Promise<T>): Promise<T> {
	if (active >= MAX_CONCURRENT) await new Promise<void>((resolve) => queue.push(resolve));
	active++;
	try {
		return await run();
	} finally {
		active--;
		queue.shift()?.();
	}
}

/**
 * fetch() for server calls to WP. Cloudflare challenges cloud-hosting ASNs, and Vercel runs on AWS, so a
 * 403 would break builds and the cart; the WAF skips its custom rules for requests carrying this token.
 * Times out after 10s unless `init.signal` is given. GET and HEAD are retried twice on a network error,
 * timeout or 5xx; other methods are sent once, since a cart or order write must not repeat.
 */
export async function wpFetch(url: string, init?: RequestInit): Promise<Response> {
	const headers = new Headers(init?.headers);
	if (process.env.WP_ORIGIN_TOKEN) headers.set("X-Majeurs-Origin", process.env.WP_ORIGIN_TOKEN);
	const method = (init?.method ?? "GET").toUpperCase();
	const retries = method === "GET" || method === "HEAD" ? RETRIES : 0;

	for (let attempt = 0; ; attempt++) {
		try {
			const res = await withSlot(() => fetch(url, { ...init, headers, signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS) }));
			if (res.status < 500 || attempt >= retries) return res;
			await res.body?.cancel();
		} catch (error) {
			if (attempt >= retries || init?.signal?.aborted) throw error;
		}
		await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
	}
}

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
