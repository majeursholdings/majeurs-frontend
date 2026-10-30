#!/usr/bin/env node
/**
 * SEO snapshot of a site, and a diff of two snapshots (the migration baseline and its checks).
 *
 *   npm run seo:snapshot -- https://majeurs.com docs/seo-baseline/majeurs.com.json
 *   npm run seo:snapshot -- http://localhost:3100 /tmp/next.json --paths-from docs/seo-baseline/majeurs.com.json
 *   npm run seo:compare -- docs/seo-baseline/majeurs.com.json /tmp/next.json
 *
 * snapshot: every URL in <site>/sitemap_index.xml (or the paths of another snapshot) -> status, redirect target,
 * title, description, robots, canonical, og:url, H1s, JSON-LD types and Product offers. Paths are stored without the
 * origin so two hosts compare.
 * compare: lists, per path, every field that differs. Exits 1 when any path differs.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const [mode, ...args] = process.argv.slice(2);
const CONCURRENCY = Number(process.env.CONCURRENCY) || 4;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0 Safari/537.36 majeurs-seo-snapshot";

const decode = (s) =>
	s
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#039;|&apos;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&nbsp;/g, " ");
const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(([, k, v]) => [k.toLowerCase(), decode(v)]));
/** Absolute URL -> path (+ query), so snapshots of two hosts line up */
const toPath = (url, base) => {
	if (!url) return null;
	try {
		const u = new URL(url, base);
		return u.pathname + u.search;
	} catch {
		return url;
	}
};

async function get(url) {
	const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA, Accept: "text/html,application/xml" }, signal: AbortSignal.timeout(60_000) });
	return { status: res.status, location: res.headers.get("location"), body: res.status === 200 ? await res.text() : "" };
}

async function sitemapPaths(site) {
	const index = await get(`${site}/sitemap_index.xml`);
	const maps = [...index.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
	const paths = new Set();
	for (const map of maps) {
		const { body } = await get(map);
		for (const [, loc] of body.matchAll(/<loc>([^<]+)<\/loc>/g)) paths.add(toPath(decode(loc), site));
	}
	return [...paths].sort();
}

function parse(html, base) {
	const head = html.slice(0, html.search(/<\/head>/i) + 1 || html.length);
	const metas = [...head.matchAll(/<meta\s[^>]*>/gi)].map(([t]) => attrs(t));
	const meta = (key) => metas.find((m) => m.name === key || m.property === key)?.content ?? null;
	const links = [...html.matchAll(/<link\s[^>]*>/gi)].map(([t]) => attrs(t));

	const types = new Set();
	const offers = [];
	const walk = (node) => {
		if (Array.isArray(node)) return node.forEach(walk);
		if (!node || typeof node !== "object") return;
		for (const t of [node["@type"]].flat().filter(Boolean)) types.add(t);
		if ([node["@type"]].flat().includes("Product")) {
			for (const o of [node.offers].flat().filter(Boolean)) {
				offers.push({ price: o.price ?? o.lowPrice ?? null, highPrice: o.highPrice ?? null, currency: o.priceCurrency ?? null });
			}
		}
		Object.values(node).forEach(walk);
	};
	for (const [, json] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
		try {
			walk(JSON.parse(json));
		} catch {}
	}

	return {
		title: text(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "") || null,
		description: meta("description"),
		robots: meta("robots"),
		canonical: toPath(links.find((l) => l.rel === "canonical")?.href, base),
		ogUrl: toPath(meta("og:url"), base),
		h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(([, h]) => text(h)).filter(Boolean),
		schemaTypes: [...types].sort(),
		offers,
	};
}

async function snapshot(site, out, pathsFrom) {
	site = site.replace(/\/$/, "");
	const paths = pathsFrom ? Object.keys(JSON.parse(await readFile(pathsFrom, "utf8")).pages) : await sitemapPaths(site);
	const pages = {};
	let done = 0;
	const queue = [...paths];
	await Promise.all(
		Array.from({ length: CONCURRENCY }, async () => {
			for (let path; (path = queue.shift()) !== undefined; ) {
				try {
					const { status, location, body } = await get(site + path);
					pages[path] = { status, redirect: toPath(location, site), ...(body ? parse(body, site) : {}) };
				} catch (error) {
					pages[path] = { status: 0, error: String(error) };
				}
				if (++done % 25 === 0) console.error(`${done}/${paths.length}`);
			}
		}),
	);
	const sorted = Object.fromEntries(Object.entries(pages).sort(([a], [b]) => a.localeCompare(b)));
	await mkdir(dirname(out), { recursive: true });
	await writeFile(out, JSON.stringify({ site, takenAt: new Date().toISOString(), pages: sorted }, null, "\t") + "\n");
	const byStatus = Object.values(sorted).reduce((acc, p) => ({ ...acc, [p.status]: (acc[p.status] ?? 0) + 1 }), {});
	console.log(`${paths.length} URLs from ${site} -> ${out}  status: ${JSON.stringify(byStatus)}`);
}

const FIELDS = ["status", "redirect", "title", "description", "robots", "canonical", "h1", "schemaTypes", "offers"];

async function compare(aFile, bFile) {
	const [a, b] = await Promise.all([aFile, bFile].map(async (f) => JSON.parse(await readFile(f, "utf8"))));
	const diffs = [];
	for (const path of Object.keys(a.pages)) {
		const pa = a.pages[path];
		const pb = b.pages[path];
		if (!pb) {
			diffs.push(`${path}\n    missing from ${b.site}`);
			continue;
		}
		const lines = FIELDS.filter((f) => JSON.stringify(pa[f] ?? null) !== JSON.stringify(pb[f] ?? null)).map(
			(f) => `    ${f}:\n      ${a.site}: ${JSON.stringify(pa[f] ?? null)}\n      ${b.site}: ${JSON.stringify(pb[f] ?? null)}`,
		);
		if (lines.length) diffs.push(`${path}\n${lines.join("\n")}`);
	}
	console.log(diffs.join("\n\n"));
	console.log(`\n${diffs.length} of ${Object.keys(a.pages).length} paths differ between ${a.site} and ${b.site}`);
	if (diffs.length) process.exit(1);
}

if (mode === "snapshot" && args.length >= 2) {
	const from = args.indexOf("--paths-from");
	await snapshot(args[0], args[1], from > -1 ? args[from + 1] : null);
} else if (mode === "compare" && args.length === 2) {
	await compare(args[0], args[1]);
} else {
	console.error("usage: seo-snapshot.mjs snapshot <site> <out.json> [--paths-from <snapshot.json>]\n       seo-snapshot.mjs compare <a.json> <b.json>");
	process.exit(2);
}
