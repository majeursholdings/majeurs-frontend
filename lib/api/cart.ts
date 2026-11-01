import { cookies, headers as requestHeaders } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { SITE_URL } from "@/lib/contact";
import { CURRENCY_COOKIE, currencies } from "@/lib/currency";
import { STORE_API, decodeEntities, wpFetch } from "./wp";

/** httpOnly cookie holding the Store API Cart-Token (a JWT valid for 48h, renewed on every cart call) */
const CART_COOKIE = "mj_cart";
const CART_MAX_AGE = 60 * 60 * 48;
/**
 * httpOnly cookie holding the Store API Nonce as "<nonce>.<first seen, unix seconds>". WordPress nonces live
 * 12–24h, so one is reused for 10h and then fetched again.
 */
const NONCE_COOKIE = "mj_cart_nonce";
const NONCE_TTL = 60 * 60 * 10;
/** Store API writes (checkout, pay for order) */
export const WRITE_TIMEOUT_MS = 60_000;

/** Money fields every Store API amount comes with */
type StoreCurrency = {
	currency_code: string;
	currency_symbol: string;
	currency_minor_unit: number;
	currency_prefix: string;
	currency_suffix: string;
};

export type StoreAddress = {
	first_name: string;
	last_name: string;
	company: string;
	address_1: string;
	address_2: string;
	city: string;
	state: string;
	postcode: string;
	country: string;
	phone: string;
	email?: string;
};

type StoreCartItem = {
	key: string;
	id: number;
	quantity: number;
	name: string;
	permalink: string;
	images: { thumbnail: string; src: string }[];
	variation: { attribute: string; value: string }[];
	prices: { price: string } & StoreCurrency;
	totals: { line_total: string } & StoreCurrency;
};

type StoreShippingRate = {
	rate_id: string;
	name: string;
	description: string;
	delivery_time: string;
	price: string;
	method_id: string;
	selected: boolean;
	meta_data: { key: string; value: string }[];
};

export type StoreCart = {
	items: StoreCartItem[];
	items_count: number;
	coupons: { code: string; totals: { total_discount: string } & StoreCurrency }[];
	fees: { name: string; totals: { total: string } & StoreCurrency }[];
	totals: {
		total_items: string;
		total_discount: string;
		total_shipping: string | null;
		total_tax: string;
		total_price: string;
		tax_lines: { name: string; price: string; rate: string }[];
	} & StoreCurrency;
	shipping_address: StoreAddress;
	billing_address: StoreAddress;
	needs_payment: boolean;
	needs_shipping: boolean;
	has_calculated_shipping: boolean;
	shipping_rates: { package_id: number; name: string; shipping_rates: StoreShippingRate[] }[];
	payment_methods: string[];
	errors: { code: string; message: string }[];
};

export type CartItem = {
	key: string;
	id: number;
	name: string;
	href: string;
	image: string | null;
	quantity: number;
	options: string[];
	price: string;
	lineTotal: string;
};

export type ShippingRate = {
	/** e.g. "flat_rate:3" or "pickup_location:0" */
	id: string;
	name: string;
	/** formatted; "Free" when it costs nothing */
	price: string;
	selected: boolean;
	/** showroom pickup (WooCommerce local pickup) */
	pickup: boolean;
	description: string;
	/** pickup only: where and how to collect */
	pickupAddress: string | null;
	pickupDetails: string | null;
};

export type ShippingPackage = { id: number; name: string; rates: ShippingRate[] };

export type Cart = {
	items: CartItem[];
	count: number;
	subtotal: string;
	/** applied coupon codes, each with the amount it takes off */
	coupons: { code: string; discount: string }[];
	/** null when no discount applies */
	discount: string | null;
	fees: { name: string; amount: string }[];
	/** null until an address (or pickup) gives WooCommerce something to price */
	shipping: string | null;
	tax: string;
	taxLines: { label: string; amount: string }[];
	total: string;
	/** ISO code of every amount above, e.g. "NGN" */
	currency: string;
	/** total in minor units (kobo, pence, cents), for the payment form */
	totalMinor: number;
	needsShipping: boolean;
	needsPayment: boolean;
	shippingPackages: ShippingPackage[];
	shippingAddress: StoreAddress;
	billingAddress: StoreAddress;
	/** gateway ids WooCommerce offers for this cart, e.g. ["paystack", "stripe"] */
	paymentMethods: string[];
	/** problems WooCommerce found with the cart (out of stock, …) */
	errors: string[];
};

export class CartError extends Error {
	constructor(
		message: string,
		public status: number,
		public code?: string,
		/** invalid_params: field -> message */
		public params?: Record<string, string>,
		/** the Store API's full answer, e.g. a checkout's payment_result */
		public body?: unknown,
	) {
		super(message);
	}
}

/**
 * Calls the WooCommerce Store API as this visitor. The Cart-Token and Nonce live in httpOnly cookies, so the
 * browser never sees them.
 *
 * The visitor's currency is forwarded as `Cookie: rtsb_currency=…`, so ShopBuilder answers with converted
 * amounts and the order is placed in that currency. With any Cookie header the Store API only honours the
 * Cart-Token when a Nonce comes with it (without one, GET /cart answers an empty cart), so every request that
 * forwards the currency, and every write, carries the Nonce. The shopper's User-Agent and IP are passed on, so
 * orders record theirs rather than the server's.
 */
export async function storeRequest<T = StoreCart>(path: string, init?: { method: string; body?: unknown }): Promise<T> {
	const [store, incoming] = await Promise.all([cookies(), requestHeaders()]);
	const method = init?.method ?? "GET";
	const forwarded: Record<string, string> = {};
	const userAgent = incoming.get("user-agent");
	const ip = incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || incoming.get("x-real-ip");
	if (userAgent) forwarded["User-Agent"] = userAgent;
	if (ip) forwarded["X-Forwarded-For"] = ip;
	// which site the shopper is on, so WordPress sends them back here after paying (docs/wordpress/majeurs-checkout.php)
	if (method !== "GET") forwarded["X-Majeurs-Site"] = siteOrigin(incoming);
	let token = store.get(CART_COOKIE)?.value;
	let nonce = readNonce(store.get(NONCE_COOKIE)?.value);
	const currency = visitorCurrency(store.get(CURRENCY_COOKIE)?.value);
	const needsNonce = method !== "GET" || currency !== null;

	const remember = (res: Response) => {
		const nextToken = res.headers.get("cart-token");
		if (nextToken && nextToken !== token) {
			token = nextToken;
			store.set(CART_COOKIE, nextToken, cookieOptions(CART_MAX_AGE));
		}
		const nextNonce = res.headers.get("nonce");
		if (nextNonce && nextNonce !== nonce) {
			nonce = nextNonce;
			store.set(NONCE_COOKIE, `${nextNonce}.${Math.floor(Date.now() / 1000)}`, cookieOptions(NONCE_TTL));
		}
	};

	// a plain GET (no Cookie header) is always honoured, and hands out a Nonce and a fresh Cart-Token
	const probe = async () => {
		const res = await wpFetch(`${STORE_API}/cart`, { headers: token ? { "Cart-Token": token } : {}, cache: "no-store" });
		await res.body?.cancel();
		remember(res);
	};

	const send = () => {
		const headers: Record<string, string> = { ...forwarded, "Content-Type": "application/json" };
		if (token) headers["Cart-Token"] = token;
		if (nonce) headers["Nonce"] = nonce;
		if (currency) headers["Cookie"] = `${CURRENCY_COOKIE}=${currency}`;
		// a write may run a gateway (create and confirm a PaymentIntent, start a Paystack transaction) and send order
		// emails inline, so it gets far longer than a read: cutting it off would report a failure for a placed order
		const signal = method === "GET" ? undefined : AbortSignal.timeout(WRITE_TIMEOUT_MS);
		return wpFetch(`${STORE_API}${path}`, { method, headers, body: init?.body ? JSON.stringify(init.body) : undefined, cache: "no-store", signal });
	};

	if (needsNonce && !nonce) await probe();
	let res = await send();
	if (res.status === 403 && needsNonce) {
		const data = await res.clone().json().catch(() => null);
		// an expired nonce is rejected before anything runs, so the request is safe to send again
		if (data?.code === "woocommerce_rest_invalid_nonce" || data?.code === "woocommerce_rest_missing_nonce") {
			nonce = null;
			await probe();
			res = await send();
		}
	}
	remember(res);

	const data = await res.json().catch(() => null);
	if (!res.ok) {
		const params = data?.data?.params && typeof data.data.params === "object" && !Array.isArray(data.data.params) ? data.data.params : undefined;
		// "Invalid parameter(s): billing_address" says nothing; the reason ("The provided postcode / ZIP is not valid") is in params
		const reason = params ? Object.values(params).find((v): v is string => typeof v === "string" && v.length > 0) : undefined;
		const message = decodeEntities(reason ?? data?.message ?? "The cart couldn't be updated.");
		throw new CartError(message, res.status, data?.code, params, data);
	}
	return data as T;
}

/** Forgets the visitor's cart (after an order is placed): the next cart call starts a new Store API session */
export async function forgetCart() {
	const store = await cookies();
	store.delete(CART_COOKIE);
	store.delete(NONCE_COOKIE);
}

/**
 * This request's origin, e.g. "https://majeurs.com", "http://majeurs.local" or a preview deployment. Falls back to
 * NEXT_PUBLIC_SITE_URL. WordPress only uses it when the host is on its allowlist.
 */
function siteOrigin(incoming: Headers): string {
	const host = incoming.get("x-forwarded-host")?.split(",")[0]?.trim() || incoming.get("host");
	if (!host) return SITE_URL;
	const proto = incoming.get("x-forwarded-proto")?.split(",")[0]?.trim() || (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? "http" : "https");
	return `${proto}://${host}`;
}

function cookieOptions(maxAge: number) {
	return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

function readNonce(value: string | undefined): string | null {
	const [nonce, seen] = value?.split(".") ?? [];
	if (!nonce || !seen) return null;
	return Date.now() / 1000 - Number(seen) < NONCE_TTL ? nonce : null;
}

/** The rtsb_currency cookie when it names a currency ShopBuilder offers */
export function visitorCurrency(value: string | undefined): string | null {
	const code = value?.toUpperCase();
	return currencies.some((c) => c.code === code) ? code! : null;
}

export async function getCart(): Promise<Cart> {
	return toCart(await storeRequest("/cart"));
}

export async function addToCart(id: number, quantity = 1, variation?: { attribute: string; value: string }[]): Promise<Cart> {
	return toCart(await storeRequest("/cart/add-item", { method: "POST", body: { id, quantity, variation } }));
}

export async function updateCartItem(key: string, quantity: number): Promise<Cart> {
	return toCart(await storeRequest("/cart/update-item", { method: "POST", body: { key, quantity } }));
}

export async function removeCartItem(key: string): Promise<Cart> {
	return toCart(await storeRequest("/cart/remove-item", { method: "POST", body: { key } }));
}

export async function applyCoupon(code: string): Promise<Cart> {
	return toCart(await storeRequest("/cart/apply-coupon", { method: "POST", body: { code } }));
}

export async function removeCoupon(code: string): Promise<Cart> {
	return toCart(await storeRequest("/cart/remove-coupon", { method: "POST", body: { code } }));
}

/** Saves the checkout address on the cart; the answer carries the shipping rates for it */
export async function updateCustomer(input: { shipping_address?: Partial<StoreAddress>; billing_address?: Partial<StoreAddress> }): Promise<Cart> {
	return toCart(await storeRequest("/cart/update-customer", { method: "POST", body: input }));
}

export async function selectShippingRate(packageId: number, rateId: string): Promise<Cart> {
	return toCart(await storeRequest("/cart/select-shipping-rate", { method: "POST", body: { package_id: packageId, rate_id: rateId } }));
}

/** Route handler response for a failed cart call */
export function cartErrorResponse(error: unknown) {
	// cookies() rejects when a build-time prerender ends; hand that back to Next instead of logging it as a failure
	unstable_rethrow(error);
	if (error instanceof CartError) return Response.json({ message: error.message, code: error.code, params: error.params }, { status: error.status });
	console.error(error);
	return Response.json({ message: "The cart is unavailable right now. Please try again." }, { status: 502 });
}

/** Store API amount (minor units, already in the cart's currency) -> "₦1,366,085.66" */
export function formatStoreMoney(minor: string | number, currency: StoreCurrency): string {
	const unit = currency.currency_minor_unit;
	const value = (Number(minor) / 10 ** unit).toLocaleString("en-US", { minimumFractionDigits: unit, maximumFractionDigits: unit });
	return `${decodeEntities(currency.currency_prefix || currency.currency_symbol)}${value}${decodeEntities(currency.currency_suffix)}`;
}

const PICKUP_METHODS = new Set(["pickup_location", "local_pickup"]);

function toCart(cart: StoreCart): Cart {
	const money = (minor: string | number, currency: StoreCurrency = cart.totals) => formatStoreMoney(minor, currency);
	const shippingPackages = cart.shipping_rates.map((pkg) => ({
		id: pkg.package_id,
		name: decodeEntities(pkg.name),
		rates: pkg.shipping_rates.map((rate) => {
			const meta = (key: string) => rate.meta_data.find((m) => m.key === key)?.value ?? null;
			return {
				id: rate.rate_id,
				name: decodeEntities(rate.name),
				price: Number(rate.price) > 0 ? money(rate.price) : "Free",
				selected: rate.selected,
				pickup: PICKUP_METHODS.has(rate.method_id),
				description: decodeEntities(rate.description || rate.delivery_time || ""),
				pickupAddress: meta("pickup_address"),
				pickupDetails: meta("pickup_details"),
			};
		}),
	}));
	const shippingChosen = shippingPackages.some((pkg) => pkg.rates.some((rate) => rate.selected));

	return {
		items: cart.items.map((item) => ({
			key: item.key,
			id: item.id,
			name: decodeEntities(item.name),
			href: new URL(item.permalink).pathname,
			image: item.images[0]?.thumbnail ?? item.images[0]?.src ?? null,
			quantity: item.quantity,
			options: item.variation.map((v) => `${decodeEntities(v.attribute)}: ${decodeEntities(v.value)}`),
			price: money(item.prices.price, item.prices),
			lineTotal: money(item.totals.line_total, item.totals),
		})),
		count: cart.items_count,
		subtotal: money(cart.totals.total_items),
		coupons: cart.coupons.map((c) => ({ code: c.code, discount: money(c.totals.total_discount, c.totals) })),
		discount: Number(cart.totals.total_discount) > 0 ? money(cart.totals.total_discount) : null,
		fees: cart.fees.map((f) => ({ name: decodeEntities(f.name), amount: money(f.totals.total, f.totals) })),
		shipping:
			cart.totals.total_shipping === null || !cart.has_calculated_shipping || !shippingChosen
				? null
				: Number(cart.totals.total_shipping) > 0
					? money(cart.totals.total_shipping)
					: "Free",
		tax: money(cart.totals.total_tax),
		taxLines: cart.totals.tax_lines.map((t) => ({ label: `${decodeEntities(t.name)} (${t.rate})`, amount: money(t.price) })),
		total: money(cart.totals.total_price),
		currency: cart.totals.currency_code,
		totalMinor: Number(cart.totals.total_price),
		needsShipping: cart.needs_shipping,
		needsPayment: cart.needs_payment,
		shippingPackages,
		shippingAddress: cart.shipping_address,
		billingAddress: cart.billing_address,
		paymentMethods: cart.payment_methods,
		errors: cart.errors.map((e) => decodeEntities(e.message)),
	};
}
