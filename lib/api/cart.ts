import { cookies } from "next/headers";
import { formatMoney, getFx, type Fx } from "./currency";
import { STORE_API, decodeEntities } from "./wp";

/** httpOnly cookie holding the Store API Cart-Token (a JWT valid for 48h, renewed on every cart call) */
const CART_COOKIE = "mj_cart";
const CART_MAX_AGE = 60 * 60 * 48;

type StoreCartItem = {
	key: string;
	id: number;
	quantity: number;
	name: string;
	permalink: string;
	images: { thumbnail: string; src: string }[];
	variation: { attribute: string; value: string }[];
	prices: { price: string; currency_minor_unit: number };
	totals: { line_total: string; currency_minor_unit: number };
};

type StoreCart = {
	items: StoreCartItem[];
	items_count: number;
	coupons: { code: string; totals: { total_discount: string; currency_minor_unit: number } }[];
	totals: {
		total_items: string;
		total_discount: string;
		total_shipping: string | null;
		total_tax: string;
		total_price: string;
		currency_minor_unit: number;
	};
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

export type Cart = {
	items: CartItem[];
	count: number;
	subtotal: string;
	/** applied coupon codes, each with the amount it takes off */
	coupons: { code: string; discount: string }[];
	/** null when no discount applies */
	discount: string | null;
	shipping: string | null;
	tax: string;
	total: string;
};

/**
 * Calls the WooCommerce Store API cart as this visitor. The Cart-Token is kept in an httpOnly cookie so
 * the browser never sees it; mutations also send the Nonce the Store API hands out on GET /cart.
 */
async function storeCart(path: string, init?: { method: string; body?: unknown }): Promise<StoreCart> {
	const store = await cookies();
	const token = store.get(CART_COOKIE)?.value;
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (token) headers["Cart-Token"] = token;

	if (init && init.method !== "GET") {
		const probe = await fetch(`${STORE_API}/cart`, { headers, cache: "no-store" });
		const nonce = probe.headers.get("nonce");
		const fresh = probe.headers.get("cart-token");
		if (nonce) headers["Nonce"] = nonce;
		if (fresh) headers["Cart-Token"] = fresh;
	}

	const res = await fetch(`${STORE_API}${path}`, {
		method: init?.method ?? "GET",
		headers,
		body: init?.body ? JSON.stringify(init.body) : undefined,
		cache: "no-store",
	});

	const next = res.headers.get("cart-token") ?? headers["Cart-Token"];
	if (next && next !== token) {
		store.set(CART_COOKIE, next, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: CART_MAX_AGE });
	}

	const data = await res.json();
	if (!res.ok) throw new CartError(decodeEntities(data?.message ?? "The cart couldn't be updated."), res.status);
	return data;
}

export class CartError extends Error {
	constructor(
		message: string,
		public status: number,
	) {
		super(message);
	}
}

export async function getCart(): Promise<Cart> {
	return toCart(await storeCart("/cart"), await getFx());
}

export async function addToCart(id: number, quantity = 1, variation?: { attribute: string; value: string }[]): Promise<Cart> {
	const cart = await storeCart("/cart/add-item", { method: "POST", body: { id, quantity, variation } });
	return toCart(cart, await getFx());
}

export async function updateCartItem(key: string, quantity: number): Promise<Cart> {
	return toCart(await storeCart("/cart/update-item", { method: "POST", body: { key, quantity } }), await getFx());
}

export async function removeCartItem(key: string): Promise<Cart> {
	return toCart(await storeCart("/cart/remove-item", { method: "POST", body: { key } }), await getFx());
}

export async function applyCoupon(code: string): Promise<Cart> {
	return toCart(await storeCart("/cart/apply-coupon", { method: "POST", body: { code } }), await getFx());
}

export async function removeCoupon(code: string): Promise<Cart> {
	return toCart(await storeCart("/cart/remove-coupon", { method: "POST", body: { code } }), await getFx());
}

/** Route handler response for a failed cart call */
export function cartErrorResponse(error: unknown) {
	if (error instanceof CartError) return Response.json({ message: error.message }, { status: error.status });
	console.error(error);
	return Response.json({ message: "The cart is unavailable right now. Please try again." }, { status: 502 });
}

function toCart(cart: StoreCart, fx: Fx): Cart {
	const unit = cart.totals.currency_minor_unit;
	return {
		items: cart.items.map((item) => ({
			key: item.key,
			id: item.id,
			name: decodeEntities(item.name),
			href: new URL(item.permalink).pathname,
			image: item.images[0]?.thumbnail ?? item.images[0]?.src ?? null,
			quantity: item.quantity,
			options: item.variation.map((v) => `${decodeEntities(v.attribute)}: ${decodeEntities(v.value)}`),
			price: formatMoney(item.prices.price, item.prices.currency_minor_unit, fx),
			lineTotal: formatMoney(item.totals.line_total, item.totals.currency_minor_unit, fx),
		})),
		count: cart.items_count,
		subtotal: formatMoney(cart.totals.total_items, unit, fx),
		coupons: cart.coupons.map((c) => ({ code: c.code, discount: formatMoney(c.totals.total_discount, c.totals.currency_minor_unit, fx) })),
		discount: Number(cart.totals.total_discount) > 0 ? formatMoney(cart.totals.total_discount, unit, fx) : null,
		shipping: cart.totals.total_shipping === null ? null : formatMoney(cart.totals.total_shipping, unit, fx),
		tax: formatMoney(cart.totals.total_tax, unit, fx),
		total: formatMoney(cart.totals.total_price, unit, fx),
	};
}
