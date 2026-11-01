import { NextResponse, type NextRequest } from "next/server";
import { goneUrls } from "@/lib/routes/wpRoutes";

const GONE = new Set(goneUrls);
const CURRENCIES = new Set(["NGN", "USD", "GBP", "EUR"]); // TODO: confirm the full ShopBuilder currency list

/**
 * Edge rules carried over from WordPress so old links never 404:
 * 1. 410 Gone for URLs Rank Math marks as deleted.
 * 2. WP search (/?s=keyword&post_type=product) -> /search/?q=keyword
 * 3. ShopBuilder currency links (?currency=GBP&__rtsb_wpnonce=…) -> set the rtsb_currency cookie, redirect to the clean URL.
 * 4. Order received (/checkout/order-received/<id>/?key=…) for the order placed in this browser -> forget the cart.
 */
export function proxy(request: NextRequest) {
	const url = request.nextUrl;
	const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;

	if (GONE.has(path) || GONE.has(url.pathname)) {
		return new NextResponse("Gone", { status: 410 });
	}

	const s = url.searchParams.get("s");
	if (url.pathname === "/" && s !== null) {
		const target = new URL("/search/", url);
		target.searchParams.set("q", s);
		return NextResponse.redirect(target, 301);
	}

	const currency = url.searchParams.get("currency");
	if (currency !== null) {
		const clean = url.clone();
		clean.searchParams.delete("currency");
		clean.searchParams.delete("__rtsb_wpnonce");
		const res = NextResponse.redirect(clean, 302);
		const code = currency.toUpperCase();
		if (CURRENCIES.has(code)) {
			res.cookies.set("rtsb_currency", code, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
		}
		return res;
	}

	// Like WooCommerce's thank-you page: once the order this browser placed is received, the next cart call starts
	// an empty cart, once (a later visit to the same page keeps whatever is in the cart by then). Abandoned payments
	// never get here, so their cart is kept. Old order links and prefetches don't count.
	const received = url.pathname.match(/^\/checkout\/order-received\/(\d+)\/?$/);
	const order = received && !request.headers.has("next-router-prefetch") ? placedHere(request, Number(received[1]), url.searchParams.get("key")) : null;
	if (order) {
		const res = NextResponse.next();
		res.cookies.delete("mj_cart");
		res.cookies.delete("mj_cart_nonce");
		res.cookies.set("mj_order", JSON.stringify({ ...order, received: true }), {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});
		return res;
	}

	return NextResponse.next();
}

/** The mj_order cookie (lib/api/checkout.ts) when it names this order and its cart hasn't been forgotten yet */
function placedHere(request: NextRequest, id: number, key: string | null): Record<string, unknown> | null {
	if (!key) return null;
	try {
		const order = JSON.parse(request.cookies.get("mj_order")?.value ?? "null") as { id?: number; key?: string; received?: boolean } | null;
		return order && order.id === id && order.key === key && !order.received ? order : null;
	} catch {
		return null;
	}
}

export const config = {
	// Skip Next internals and static files
	matcher: ["/((?!_next/|images/|font/|favicon.ico|icon.png|apple-icon.png).*)"],
};
