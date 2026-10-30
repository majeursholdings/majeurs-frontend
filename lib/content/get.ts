import { cacheLife, cacheTag } from "next/cache";
import { WP_API, WP_URL, wpFetch } from "@/lib/api/wp";
import type { Cta, Field, Fields, PageContent, SiteContent, Values } from "./model.ts";

/** The `page:<slug>` cache tag the WP save hook revalidates (docs/wordpress/majeurs-content.php) */
export const pageTag = (path: string) => `page:${path.split("/").filter(Boolean).at(-1) ?? "home"}`;

/**
 * A page's copy from its ACF fields (wp-admin > Pages > the page), with the definition's default for any field that's
 * empty: a new field, a page not seeded yet, an editor clearing it, or WP unreachable. Secure Custom Fields answers
 * "" / false both for "never saved" and "cleared", so an empty field can't blank a page; a field whose default is
 * empty (an optional badge, "last updated") stays hidden. Cached for hours, tagged `page:<slug>` so saving the page
 * in wp-admin refreshes it.
 */
export async function getPageContent<F extends Fields>(page: PageContent<F>): Promise<Values<F>> {
	return merge(page.fields, await getAcf(page.wpId, pageTag(page.path))) as Values<F>;
}

async function getAcf(wpId: number, tag: string): Promise<Record<string, unknown> | null> {
	"use cache";
	cacheTag(tag);
	try {
		// acf_format=standard: images come back as URLs and links as { title, url, target }, as on the theme
		const res = await wpFetch(`${WP_API}/pages/${wpId}?_fields=acf&acf_format=standard`);
		const data: { acf?: Record<string, unknown> | [] } | null = res.ok ? await res.json() : null;
		// ACF answers [] for a page with no field group
		if (!data?.acf || Array.isArray(data.acf)) throw new Error("no ACF fields");
		cacheLife("hours");
		return data.acf;
	} catch {
		cacheLife("minutes");
		return null;
	}
}

/** Copy from wp-admin > Site content (one request for every section), defaults filled in the same way. Tagged `site-content`. */
export async function getSiteContent<F extends Fields>(section: SiteContent<F>): Promise<Values<F>> {
	return merge(section.fields, (await getSiteAcf())?.[section.id]) as Values<F>;
}

async function getSiteAcf(): Promise<Record<string, Record<string, unknown>> | null> {
	"use cache";
	cacheTag("site-content");
	try {
		const res = await wpFetch(`${WP_URL}/wp-json/majeurs/v1/content/site`);
		if (!res.ok) throw new Error(`site content ${res.status}`);
		cacheLife("hours");
		return await res.json();
	} catch {
		cacheLife("minutes");
		return null;
	}
}

function merge(fields: Fields, acf: Record<string, unknown> | null | undefined): Record<string, unknown> {
	return Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, value(field, acf?.[name])]));
}

/** Empty ("", false, null: SCF's value for an unsaved or cleared field, empty repeater or image) falls back to the default */
function value(field: Field, raw: unknown): unknown {
	if (raw === null || raw === undefined || raw === false || raw === "") return field.default;
	switch (field.kind) {
		case "text":
		case "textarea":
		case "rich":
			return typeof raw === "string" && raw.trim() ? raw : field.default;
		case "image":
			if (typeof raw === "string") return raw || field.default;
			return (raw as { url?: string }).url || field.default;
		case "link":
			return toCta(raw) ?? field.default;
		case "list":
			return Array.isArray(raw) ? raw.map((row) => merge(field.fields, row as Record<string, unknown>)) : field.default;
	}
}

function toCta(raw: unknown): Cta | null {
	const l = raw as { title?: string; url?: string; target?: string };
	if (!l.url) return null;
	return { label: l.title ?? "", href: toSitePath(l.url), external: l.target === "_blank" || undefined };
}

/** An editor pasting https://majeurs.com/shop/ (or the WP host) means /shop/ on this site */
function toSitePath(url: string): string {
	const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
	for (const origin of [site, process.env.WP_URL, "https://majeurs.com", "https://www.majeurs.com"]) {
		if (origin && url.startsWith(origin) && !url.includes("/wp-content/")) return url.slice(origin.length) || "/";
	}
	return url;
}
