import { staysOnWordPress } from "./routes.ts";

/**
 * majeurs.com edge router. Runs on every majeurs.com request (cloudflare.config.ts). WordPress's own requests
 * (wp-admin, REST API, media, payment callbacks: src/routes.ts) go on to the WordPress origin unchanged; every
 * other request is proxied to the Next.js deployment on Vercel. WordPress keeps the majeurs.com domain, so
 * there's no proxy loop.
 */

export interface Env {
	/** the Vercel production URL, e.g. https://majeurs-frontend.vercel.app */
	NEXT_ORIGIN: string;
	/** "off" sends everything to WordPress: the kill switch (cf deploy with ROUTING=off) */
	ROUTING: string;
	/**
	 * Shared with Next.js (EDGE_SECRET on Vercel Production). Proves a request came through this Worker, so Next.js can
	 * trust X-Majeurs-Client-IP and knows the vercel.app URL was reached directly (lib/edge.ts).
	 */
	EDGE_SECRET: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (env.ROUTING === "off" || staysOnWordPress(url)) {
			// on a route, fetch(request) continues to the zone's origin (WordPress), with WAF and cache rules as before
			return fetch(request);
		}
		if (request.method === "GET" && url.pathname.startsWith("/_next/image")) {
			return cachedImage(request, url, env, ctx);
		}
		return proxyToNext(request, url, env);
	},
};

/**
 * Optimised images (/_next/image?url=…&w=…&q=…) from this edge's cache. Cloudflare doesn't cache them by itself (no
 * file extension), so every request went to Vercel, whose own image cache is per region and misses often: 0.5-1 s
 * for the hero image, the page's LCP. Vercel picks AVIF, WebP or the original from the Accept header, so the
 * cache key carries the format and the upstream request gets a normalised Accept, keeping one entry per format.
 */
async function cachedImage(request: Request, url: URL, env: Env, ctx: ExecutionContext): Promise<Response> {
	const accept = request.headers.get("accept") ?? "";
	const format = accept.includes("image/avif") ? "avif" : accept.includes("image/webp") ? "webp" : "original";
	const key = new Request(`${url.origin}${url.pathname}${url.search}${url.search ? "&" : "?"}_fmt=${format}`);
	const cache = caches.default;
	const hit = await cache.match(key);
	if (hit) {
		const out = new Response(hit.body, hit);
		out.headers.set("x-majeurs-image-cache", "HIT");
		return out;
	}
	const headers = new Headers(request.headers);
	headers.set("accept", { avif: "image/avif,image/webp,image/*,*/*;q=0.8", webp: "image/webp,image/*,*/*;q=0.8", original: "image/*,*/*;q=0.8" }[format]);
	const res = await proxyToNext(new Request(request, { headers }), url, env);
	// Vercel marks optimised images public with a max-age (minimumCacheTTL); errors and private responses stay uncached
	if (res.ok && (res.headers.get("cache-control") ?? "").includes("public")) {
		ctx.waitUntil(cache.put(key, res.clone()));
	}
	res.headers.set("x-majeurs-image-cache", "MISS");
	return res;
}

async function proxyToNext(request: Request, url: URL, env: Env): Promise<Response> {
	const origin = new URL(env.NEXT_ORIGIN);
	const target = new URL(`${url.pathname}${url.search}`, origin);
	const headers = new Headers(request.headers);
	// Vercel rewrites X-Forwarded-Host to its own host; proxy.ts reads the visitor's host from this one
	headers.set("x-majeurs-host", url.host);
	headers.set("x-majeurs-proto", url.protocol.replace(":", ""));
	// Vercel sees this Worker's address, not the visitor's: pass the visitor's IP (cart, checkout and login send it to
	// WordPress for fraud checks and rate limits), with the secret that makes Next.js trust it
	headers.set("x-majeurs-client-ip", request.headers.get("cf-connecting-ip") ?? "");
	headers.set("x-majeurs-edge", env.EDGE_SECRET ?? "");

	const res = await fetch(target, {
		method: request.method,
		headers,
		body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
		// pass redirects (trailing slash, legacy URLs, Paystack hand-offs) to the browser
		redirect: "manual",
	});

	const out = new Response(res.body, res);
	const location = res.headers.get("location");
	if (location) {
		// Next.js builds absolute redirects on the host it was reached on (the vercel.app URL)
		const next = new URL(location, target);
		if (next.host === origin.host) {
			next.protocol = url.protocol;
			next.host = url.host;
			out.headers.set("location", next.toString());
		}
	}
	out.headers.set("x-majeurs-served-by", "next");
	return out;
}
