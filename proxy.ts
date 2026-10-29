import { NextResponse, type NextRequest } from "next/server";
import { goneUrls } from "@/lib/routes/wpRoutes";

const GONE = new Set(goneUrls);
const CURRENCIES = new Set(["NGN", "USD", "GBP", "EUR"]); // TODO: confirm the full ShopBuilder currency list

/**
 * Edge rules carried over from WordPress so old links never 404:
 * 1. 410 Gone for URLs Rank Math marks as deleted.
 * 2. WP search (/?s=keyword&post_type=product) -> /search/?q=keyword
 * 3. ShopBuilder currency links (?currency=GBP&__rtsb_wpnonce=…) -> set the rtsb_currency cookie, redirect to the clean URL.
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

	return NextResponse.next();
}

export const config = {
	// Skip Next internals and static files
	matcher: ["/((?!_next/|images/|font/|favicon.ico|icon.png|apple-icon.png).*)"],
};
