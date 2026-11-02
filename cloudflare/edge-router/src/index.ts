import { LIVE_GROUPS, isNextPath, mustStayOnWordPress, rulesFor } from "./routes.ts";

/**
 * majeurs.com edge router. Runs only on the routes in cloudflare.config.ts. Paths Next.js answers (src/routes.ts)
 * are proxied to the Vercel deployment; everything else, including payment callbacks on those paths, goes on
 * to the WordPress origin unchanged. WordPress keeps the majeurs.com domain, so there's no proxy loop.
 */

export interface Env {
	/** the Vercel production URL, e.g. https://majeurs-frontend.vercel.app */
	NEXT_ORIGIN: string;
	/** "off" sends everything to WordPress: the kill switch (cf deploy with ROUTING=off) */
	ROUTING: string;
}

const RULES = rulesFor(LIVE_GROUPS);

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (env.ROUTING === "off" || mustStayOnWordPress(url) || !isNextPath(url.pathname, RULES)) {
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
