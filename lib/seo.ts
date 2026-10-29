import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { WP_URL, decodeEntities } from "@/lib/api/wp";
import { SITE_URL } from "@/lib/contact";

/**
 * Rank Math SEO for a URL, from its headless endpoint (Rank Math > General Settings > Others > Headless CMS Support):
 *   GET /wp-json/rankmath/v1/getHead?url=<WP home><path>  ->  { success, head: "<title>…<meta…><link…><script type=application/ld+json>…" }
 * Pages pass their own metadata as a fallback, used as-is while the endpoint is off or unreachable.
 */
export type RankMathHead = {
	title: string | null;
	canonical: string | null;
	/** [name or property, content], in order; og:image and article:tag can repeat */
	meta: [string, string][];
	/** parsed JSON-LD blocks */
	schemas: unknown[];
};

const WP_ORIGIN = new URL(WP_URL).origin;

/** Path on this site, e.g. "/product/osisi/" or "/shop/page/2/". Cached an hour (a minute when Rank Math is unavailable). */
export async function getRankMathHead(path: string): Promise<RankMathHead | null> {
	"use cache";
	cacheTag("seo", `seo:${path}`);

	try {
		const res = await fetch(`${WP_URL}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(`${WP_ORIGIN}${path}`)}`, { signal: AbortSignal.timeout(10_000) });
		const data: { success?: boolean; head?: string } | null = res.ok ? await res.json() : null;
		if (!data?.success || !data.head) {
			cacheLife("minutes");
			return null;
		}
		cacheLife("hours");
		return parseHead(data.head);
	} catch {
		cacheLife("minutes");
		return null;
	}
}

/**
 * Next.js metadata for a page: Rank Math's title, description, robots, canonical, Open Graph and Twitter tags over
 * `fallback`. `force` wins over both (e.g. noindex on cart and checkout).
 */
export async function seoMetadata(path: string, fallback: Metadata = {}, force: Metadata = {}): Promise<Metadata> {
	return toMetadata(await getRankMathHead(path), path, fallback, force);
}

export function toMetadata(head: RankMathHead | null, path: string, fallback: Metadata = {}, force: Metadata = {}): Metadata {
	if (!head) return { ...fallback, alternates: { canonical: path, ...fallback.alternates }, ...force };

	const one = (key: string) => head.meta.find(([k]) => k === key)?.[1];
	const all = (key: string) => head.meta.filter(([k]) => k === key).map(([, v]) => v);

	const ogType = one("og:type");
	const images = all("og:image").map((url, i) => ({
		url,
		width: Number(all("og:image:width")[i]) || undefined,
		height: Number(all("og:image:height")[i]) || undefined,
		alt: all("og:image:alt")[i],
	}));

	// Next.js has no Open Graph "product" type or product:* fields, so those go out as plain meta tags
	const other: Record<string, string | string[]> = {};
	for (const [key, value] of head.meta) {
		if (key.startsWith("product:") || /^twitter:(label|data)\d$/.test(key) || (key === "og:type" && ogType === "product")) {
			other[key] = key in other ? [other[key], value].flat() : value;
		}
	}

	const title = head.title ? { absolute: head.title } : fallback.title;
	const description = one("description") ?? fallback.description;

	return {
		...fallback,
		title,
		description,
		robots: parseRobots(one("robots")) ?? fallback.robots,
		alternates: { ...fallback.alternates, canonical: head.canonical ?? fallback.alternates?.canonical ?? path },
		openGraph: {
			...(ogType === "article" ? { type: "article", publishedTime: one("article:published_time"), modifiedTime: one("article:modified_time"), section: one("article:section"), tags: all("article:tag") } : {}),
			...(ogType === "website" ? { type: "website" } : {}),
			siteName: one("og:site_name") ?? "Majeurs",
			locale: one("og:locale") ?? "en_NG",
			title: one("og:title") ?? head.title ?? undefined,
			description: one("og:description") ?? description ?? undefined,
			url: one("og:url") ?? head.canonical ?? path,
			images: images.length ? images : fallback.openGraph?.images,
		},
		twitter: {
			card: (one("twitter:card") as "summary" | "summary_large_image" | undefined) ?? "summary_large_image",
			title: one("twitter:title") ?? head.title ?? undefined,
			description: one("twitter:description") ?? description ?? undefined,
			images: all("twitter:image").length ? all("twitter:image") : undefined,
			site: one("twitter:site"),
			creator: one("twitter:creator"),
		},
		other: Object.keys(other).length ? other : undefined,
		...force,
	};
}

/** "follow, index, max-snippet:-1, max-image-preview:large" -> Next.js robots */
function parseRobots(value: string | undefined): Metadata["robots"] {
	if (!value) return undefined;
	const directives = value.split(",").map((d) => d.trim().toLowerCase());
	const setting = (name: string) => directives.find((d) => d.startsWith(`${name}:`))?.slice(name.length + 1);
	const preview = setting("max-image-preview");
	return {
		index: !directives.includes("noindex"),
		follow: !directives.includes("nofollow"),
		"max-snippet": setting("max-snippet") ? Number(setting("max-snippet")) : undefined,
		"max-video-preview": setting("max-video-preview") ? Number(setting("max-video-preview")) : undefined,
		"max-image-preview": preview === "none" || preview === "standard" || preview === "large" ? preview : undefined,
	};
}

export function parseHead(html: string): RankMathHead {
	const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(([, k, v]) => [k.toLowerCase(), decodeEntities(v)]));

	const meta: [string, string][] = [];
	for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
		const a = attrs(tag);
		const key = a.property ?? a.name;
		if (key && a.content !== undefined) meta.push([key, toSiteUrl(a.content)]);
	}

	const canonicalTag = [...html.matchAll(/<link\s[^>]*>/gi)].map(([tag]) => attrs(tag)).find((a) => a.rel === "canonical");
	const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];

	const schemas: unknown[] = [];
	for (const [, json] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
		try {
			schemas.push(rewriteUrls(JSON.parse(json)));
		} catch {}
	}

	return {
		title: title ? decodeEntities(title.trim()) : null,
		canonical: canonicalTag?.href ? toSiteUrl(canonicalTag.href) : null,
		meta,
		schemas,
	};
}

/** WP page URLs -> this site; uploads stay on WP */
function toSiteUrl(value: string): string {
	if (WP_ORIGIN === SITE_URL) return value;
	return value.replace(new RegExp(`${WP_ORIGIN.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(?!/wp-(?:content|includes)/)`, "g"), SITE_URL);
}

function rewriteUrls(value: unknown): unknown {
	if (typeof value === "string") return toSiteUrl(value);
	if (Array.isArray(value)) return value.map(rewriteUrls);
	if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewriteUrls(v)]));
	return value;
}
