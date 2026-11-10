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
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (env.ROUTING === "off" || staysOnWordPress(url)) {
			// on a route, fetch(request) continues to the zone's origin (WordPress), with WAF and cache rules as before
			return fetch(request);
		}
		return proxyToNext(request, url, env);
	},
};

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
