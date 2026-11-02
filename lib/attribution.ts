/**
 * WooCommerce order attribution for the headless site. On WordPress, WooCommerce's sourcebuster.js records where
 * the visitor came from in cookies and the checkout sends it with the order. Here proxy.ts does the same on every
 * page load (`updateAttribution`) into one httpOnly cookie, and placeOrder sends it as the Store API extension
 * `woocommerce/order-attribution` (`attributionExtension`), so wp-admin shows each order's source.
 *
 * Rules follow sourcebuster: UTM parameters (or gclid) and outside referrers start a new source; a visit with no
 * referrer only counts as "typein" when nothing is known yet. A session ends after 30 minutes without a page view.
 * Edge-safe: no Node APIs.
 */

export const ATTRIBUTION_COOKIE = "mj_attribution";
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 183; // sourcebuster keeps its cookies 6 months

const SESSION_MS = 30 * 60 * 1000;
const MAX_LENGTH = 200;

/** Search engines whose referrals count as organic, by host */
const SEARCH_ENGINES: [RegExp, string][] = [
	[/(^|\.)google\./, "google"],
	[/(^|\.)bing\.com$/, "bing"],
	[/(^|\.)yahoo\./, "yahoo"],
	[/(^|\.)duckduckgo\.com$/, "duckduckgo"],
	[/(^|\.)yandex\./, "yandex"],
	[/(^|\.)baidu\.com$/, "baidu"],
	[/(^|\.)ecosia\.org$/, "ecosia"],
	[/(^|\.)search\.brave\.com$/, "brave"],
];

/** Returns from payment pages aren't a new source */
const IGNORED_REFERRERS = [/(^|\.)paystack\.(com|co)$/, /(^|\.)stripe\.com$/];

const UTM_FIELDS = {
	utm_source: "src",
	utm_medium: "mdm",
	utm_campaign: "cmp",
	utm_content: "cnt",
	utm_id: "id",
	utm_term: "trm",
	utm_source_platform: "plt",
	utm_creative_format: "fmt",
	utm_marketing_tactic: "tct",
} as const;

type Source = { typ: "utm" | "organic" | "referral" | "typein" } & Partial<Record<(typeof UTM_FIELDS)[keyof typeof UTM_FIELDS], string>>;

export type Attribution = {
	current: Source;
	/** referrer, entry page and first visit time of the current source */
	rf: string;
	ep: string;
	fd: string;
	/** visits (sessions) so far, pages in this session, last page view (ms) */
	vst: number;
	pgs: number;
	last: number;
};

export function parseAttribution(value: string | undefined): Attribution | null {
	if (!value) return null;
	try {
		const a = JSON.parse(value) as Attribution;
		return a && typeof a === "object" && a.current?.typ ? a : null;
	} catch {
		return null;
	}
}

/** The cookie after a page view of `url`, arrived at from `referrer` (the Referer header) */
export function updateAttribution(previous: Attribution | null, url: URL, referrer: string | null, now = Date.now()): Attribution {
	const newSession = !previous || now - previous.last > SESSION_MS;
	const source = sourceOf(url, referrer);
	const base: Attribution =
		previous && !source
			? previous
			: {
					current: source ?? { typ: "typein", src: "(direct)", mdm: "(none)" },
					rf: clip(referrer ?? "(none)"),
					ep: clip(url.href),
					fd: formatTime(now),
					vst: previous?.vst ?? 0,
					pgs: previous?.pgs ?? 0,
					last: now,
				};
	return { ...base, vst: base.vst + (newSession ? 1 : 0), pgs: newSession ? 1 : base.pgs + 1, last: now };
}

/** A new traffic source for this page view, or null when it continues the current one */
function sourceOf(url: URL, referrer: string | null): Source | null {
	const params = url.searchParams;
	if (Object.keys(UTM_FIELDS).some((k) => params.has(k))) {
		const source: Source = { typ: "utm" };
		for (const [param, key] of Object.entries(UTM_FIELDS)) {
			const value = params.get(param);
			if (value) source[key] = clip(value);
		}
		return source;
	}
	if (params.has("gclid")) return { typ: "utm", src: "google", mdm: "cpc", cmp: "(none)" };

	const host = hostOf(referrer);
	if (!host || host === url.hostname || host.endsWith(".majeurs.com") || host === "majeurs.com") return null;
	if (IGNORED_REFERRERS.some((r) => r.test(host))) return null;
	const engine = SEARCH_ENGINES.find(([r]) => r.test(host));
	if (engine) return { typ: "organic", src: engine[1], mdm: "organic" };
	return { typ: "referral", src: host.replace(/^www\./, ""), mdm: "referral" };
}

/** The Store API checkout extension WooCommerce's order attribution reads (field names as in its checkout script) */
export function attributionExtension(a: Attribution | null, userAgent: string | null): Record<string, string> | null {
	if (!a) return null;
	const c = a.current;
	const fields: Record<string, string | undefined> = {
		source_type: c.typ,
		referrer: a.rf,
		utm_source: c.src,
		utm_medium: c.mdm,
		utm_campaign: c.cmp,
		utm_content: c.cnt,
		utm_id: c.id,
		utm_term: c.trm,
		utm_source_platform: c.plt,
		utm_creative_format: c.fmt,
		utm_marketing_tactic: c.tct,
		session_entry: a.ep,
		session_start_time: a.fd,
		session_pages: String(a.pgs),
		session_count: String(a.vst),
		user_agent: userAgent ?? undefined,
	};
	return Object.fromEntries(Object.entries(fields).filter((e): e is [string, string] => Boolean(e[1])));
}

function hostOf(referrer: string | null): string | null {
	if (!referrer) return null;
	try {
		return new URL(referrer).hostname.toLowerCase();
	} catch {
		return null;
	}
}

function clip(value: string): string {
	return value.slice(0, MAX_LENGTH);
}

/** sourcebuster's format, "2026-11-02 14:05:09" (UTC here) */
function formatTime(ms: number): string {
	return new Date(ms).toISOString().slice(0, 19).replace("T", " ");
}
