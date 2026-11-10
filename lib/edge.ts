/**
 * Requests from the majeurs.com edge router (cloudflare/edge-router). The Worker proxies visitors to this Vercel
 * deployment, so Vercel sees the Worker's address; it adds the visitor's IP (X-Majeurs-Client-IP) and the shared
 * EDGE_SECRET (X-Majeurs-Edge) so the IP can be trusted. EDGE_SECRET is set on Vercel Production only.
 */

type HeaderSource = { get(name: string): string | null };

/** The request came through the edge router (always false while EDGE_SECRET isn't set, e.g. locally) */
export function fromEdge(headers: HeaderSource): boolean {
	const secret = process.env.EDGE_SECRET;
	return Boolean(secret) && safeEqual(headers.get("x-majeurs-edge") ?? "", secret!);
}

/** The visitor's IP: the edge router's header when it's genuine, else the first X-Forwarded-For hop, else X-Real-IP */
export function clientIp(headers: HeaderSource): string {
	if (fromEdge(headers)) {
		const ip = headers.get("x-majeurs-client-ip")?.trim();
		if (ip) return ip;
	}
	return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "";
}

/** Compares without stopping at the first different character */
function safeEqual(a: string, b: string): boolean {
	let diff = a.length ^ b.length;
	for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
	return diff === 0;
}
