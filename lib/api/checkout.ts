import { cookies } from "next/headers";
import { countryName, statesOf } from "@/lib/checkout/countries";
import { CURRENCY_COOKIE } from "@/lib/currency";
import { CartError, WRITE_TIMEOUT_MS, formatStoreMoney, storeRequest, visitorCurrency, type StoreAddress } from "./cart";
import { STORE_API, WP_URL, decodeEntities, wpFetch } from "./wp";

/**
 * Placing and reading orders through the WooCommerce Store API (the cart session in lib/api/cart.ts).
 * Server-only. Gateway details: Paystack must use its "Redirect" payment option, Stripe uses deferred
 * intents (see docs/IMPLEMENTATION_PLAN.md, Phase 3).
 */

/** httpOnly cookie remembering the last order placed here, so its thank-you page can read it back */
const ORDER_COOKIE = "mj_order";
type RememberedOrder = { id: number; key: string; email: string; currency: string | null };

export type PaymentData = { key: string; value: string }[];

export type PlaceOrderInput = {
	billing_address: StoreAddress & { email: string };
	shipping_address: StoreAddress;
	payment_method: string;
	payment_data?: PaymentData;
	customer_note?: string;
	newsletter?: boolean;
	/** the total the shopper saw (minor units); WooCommerce refuses the order if it has gone up since */
	expected_total?: number;
};

export type PlacedOrder = {
	orderId: number;
	orderKey: string;
	orderNumber: string;
	status: string;
	/** success | pending | failure | error. "success" isn't "paid": a gateway step may still follow */
	paymentStatus: string;
	/** where to send the customer next: a gateway page, or our own order-received page */
	redirectUrl: string;
	paymentDetails: Record<string, string>;
};

type StoreCheckoutResponse = {
	order_id: number;
	status: string;
	order_key: string;
	order_number: string;
	payment_result: { payment_status: string; payment_details: { key: string; value: string }[]; redirect_url: string } | null;
};

const GATEWAY_NAMES: Record<string, string> = { paystack: "Paystack", stripe: "card" };

/**
 * POST /checkout: creates the order from the cart and runs the gateway, in the visitor's currency (the Cookie
 * storeRequest forwards). The cart is left alone: it's forgotten when the customer reaches the order-received
 * page (proxy.ts), so an abandoned payment keeps the cart, and a retry reuses the same pending order.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
	let res: StoreCheckoutResponse;
	try {
		res = await storeRequest<StoreCheckoutResponse>("/checkout", {
			method: "POST",
			body: {
				billing_address: input.billing_address,
				shipping_address: input.shipping_address,
				payment_method: input.payment_method,
				payment_data: input.payment_data ?? [],
				customer_note: input.customer_note ?? "",
				...(input.expected_total !== undefined ? { expected_total: String(input.expected_total) } : {}),
				// Mailchimp for WooCommerce reads `optin` unconditionally, so always send it
				extensions: { "mailchimp-newsletter": { optin: Boolean(input.newsletter) } },
			},
		});
	} catch (error) {
		throw orderFailure(error, input.payment_method);
	}

	const order: PlacedOrder = {
		orderId: res.order_id,
		orderKey: res.order_key,
		orderNumber: res.order_number,
		status: res.status,
		paymentStatus: res.payment_result?.payment_status ?? "error",
		redirectUrl: toSiteUrl(res.payment_result?.redirect_url ?? ""),
		paymentDetails: Object.fromEntries((res.payment_result?.payment_details ?? []).map((d) => [d.key, d.value])),
	};
	const store = await cookies();
	await rememberOrder({ id: order.orderId, key: order.orderKey, email: input.billing_address.email, currency: visitorCurrency(store.get(CURRENCY_COOKIE)?.value) });
	return order;
}

/**
 * A failed order write, in words the customer can act on:
 * - a gateway that fails without a message answers a bare checkout body (payment_status "failure"), and when
 *   Paystack can't start a transaction WooCommerce may even crash (500, not JSON);
 * - a write that ran out of time may still have gone through (WordPress keeps going), so it must not invite a retry
 *   that could create and charge a second order.
 */
function orderFailure(error: unknown, paymentMethod: string): unknown {
	if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
		return new CartError(
			"Your order is taking longer than usual to confirm. Please don't place it again: check your email for a confirmation in the next few minutes, or contact us and we'll check it for you.",
			504,
			"order_timeout",
		);
	}
	if (error instanceof CartError && (!error.code || (error.body as StoreCheckoutResponse | undefined)?.payment_result)) {
		const gateway = GATEWAY_NAMES[paymentMethod] ?? "this payment method";
		return new CartError(`We couldn't start your payment with ${gateway}. Please try again, or choose another payment method.`, error.status, "payment_failed");
	}
	return error;
}

/**
 * WordPress builds order-received links on its own domain; on staging that's api.majeurs.com, so they're
 * pointed at this site (in production WP shares majeurs.com and docs/wordpress/majeurs-checkout.php filters
 * them). Gateway pages and WP's order-pay page are left alone.
 */
export function toSiteUrl(url: string): string {
	if (!url) return url;
	try {
		const parsed = new URL(url, WP_URL);
		if (parsed.host === new URL(WP_URL).host && parsed.pathname.startsWith("/checkout/order-received/")) {
			return `${parsed.pathname}${parsed.search}`;
		}
		return parsed.href;
	} catch {
		return url;
	}
}

async function rememberOrder(order: RememberedOrder) {
	if (!order.id || !order.key) return;
	(await cookies()).set(ORDER_COOKIE, JSON.stringify(order), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});
}

/** The order this browser placed, when it's this one (the Store API asks guests for its billing email) */
async function rememberedOrder(id: number, key: string): Promise<RememberedOrder | null> {
	try {
		const saved = JSON.parse((await cookies()).get(ORDER_COOKIE)?.value ?? "null") as RememberedOrder | null;
		return saved && saved.id === id && saved.key === key ? saved : null;
	} catch {
		return null;
	}
}

/**
 * After Stripe's 3-D Secure step: tells the Stripe gateway to check the PaymentIntent and update the order
 * (its wc-ajax endpoint; the nonce came in the checkout answer). Answers our order-received path.
 */
export async function confirmStripeOrder(input: { orderId: number; orderKey: string; intentId: string; nonce: string }): Promise<string> {
	const body = new URLSearchParams({ order_id: String(input.orderId), intent_id: input.intentId, payment_method_id: "", _ajax_nonce: input.nonce });
	const res = await wpFetch(`${WP_URL}/?wc-ajax=wc_stripe_update_order_status`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body,
		cache: "no-store",
		signal: AbortSignal.timeout(WRITE_TIMEOUT_MS),
	});
	const data = (await res.json().catch(() => null)) as { success: boolean; data?: { return_url?: string; error?: { message?: string } } } | null;
	if (!data?.success) {
		throw new CartError(decodeEntities(data?.data?.error?.message ?? "Your card couldn't be confirmed. Please try again, or use another card."), 402, "payment_failed");
	}
	return toSiteUrl(data.data?.return_url ?? "") || orderReceivedPath(input.orderId, input.orderKey);
}

/**
 * Pays for an existing order (failed or abandoned payment, or a "pay for this order" link) through the Store
 * API's pay-for-order route. It replaces the order's billing address, so the saved one is sent back unchanged.
 */
export async function payForOrder(input: { orderId: number; orderKey: string; payment_method: string; payment_data?: PaymentData }): Promise<PlacedOrder> {
	const order = await getReceivedOrder(input.orderId, input.orderKey);
	if (!order) throw new CartError("We couldn't find this order. Please use the link from your order email.", 404, "invalid_order");
	if (!order.needsPayment) throw new CartError("This order doesn't need paying.", 409, "order_paid");

	const query = new URLSearchParams({ key: input.orderKey, billing_email: order.email });
	let res: StoreCheckoutResponse;
	try {
		res = await storeRequest<StoreCheckoutResponse>(`/checkout/${input.orderId}?${query}`, {
			method: "POST",
			body: { billing_address: order.billingAddress, payment_method: input.payment_method, payment_data: input.payment_data ?? [] },
		});
	} catch (error) {
		throw orderFailure(error, input.payment_method);
	}
	return {
		orderId: res.order_id || input.orderId,
		orderKey: res.order_key || input.orderKey,
		orderNumber: res.order_number,
		status: res.status,
		paymentStatus: res.payment_result?.payment_status ?? "error",
		redirectUrl: toSiteUrl(res.payment_result?.redirect_url ?? ""),
		paymentDetails: Object.fromEntries((res.payment_result?.payment_details ?? []).map((d) => [d.key, d.value])),
	};
}

/**
 * Lets this browser see and pay an order it didn't place (a link from the order email): checks the billing
 * email against the order, then remembers it like a freshly placed order. False when they don't match.
 */
export async function unlockOrder(id: number, key: string, email: string): Promise<boolean> {
	const query = new URLSearchParams({ key, billing_email: email });
	const res = await wpFetch(`${STORE_API}/order/${id}?${query}`, { cache: "no-store" });
	if (!res.ok) {
		await res.body?.cancel();
		return false;
	}
	const order = (await res.json()) as StoreOrder;
	// the Store API labels amounts in the request's currency, not the order's: ask WordPress (majeurs-checkout.php),
	// else the visitor's own currency is the best guess
	const currency = (await orderCurrency(id, key)) ?? visitorCurrency((await cookies()).get(CURRENCY_COOKIE)?.value);
	await rememberOrder({ id, key, email: order.billing_address.email || email, currency });
	return true;
}

/** The currency an order was placed in (GET /majeurs/v1/order-currency, docs/wordpress/majeurs-checkout.php); null when unknown */
async function orderCurrency(id: number, key: string): Promise<string | null> {
	try {
		const res = await wpFetch(`${WP_URL}/wp-json/majeurs/v1/order-currency?${new URLSearchParams({ id: String(id), key })}`, { cache: "no-store" });
		if (!res.ok) {
			await res.body?.cancel();
			return null;
		}
		const data = (await res.json()) as { currency?: string };
		return visitorCurrency(data.currency);
	} catch {
		return null;
	}
}

export const orderReceivedPath = (id: number, key: string) => `/checkout/order-received/${id}/?key=${encodeURIComponent(key)}`;

type StoreMoney = { currency_code: string; currency_symbol: string; currency_minor_unit: number; currency_prefix: string; currency_suffix: string };

type StoreOrder = {
	id: number;
	status: string;
	items: {
		key: string;
		name: string;
		quantity: number;
		permalink: string;
		images: { thumbnail: string; src: string }[];
		variation: { attribute: string; value: string }[];
		totals: { line_total: string } & StoreMoney;
	}[];
	totals: {
		subtotal: string;
		total_discount: string;
		total_shipping: string;
		total_fees: string;
		total_tax: string;
		total_refund: string;
		total_price: string;
		tax_lines: { name: string; price: string; rate: string }[];
	} & StoreMoney;
	coupons: { code: string }[];
	shipping_address: StoreAddress;
	billing_address: StoreAddress & { email: string };
	needs_payment: boolean;
	needs_shipping: boolean;
};

export type ReceivedOrder = {
	id: number;
	key: string;
	/** pending | processing | on-hold | completed | failed | cancelled | refunded … */
	status: string;
	needsPayment: boolean;
	items: { name: string; quantity: number; total: string; options: string[]; href: string; image: string | null }[];
	totals: { label: string; value: string }[];
	/** formatted total, its minor units and currency (for paying again) */
	total: string;
	totalMinor: number;
	currency: string;
	/** as WooCommerce has it, for paying again (the pay-for-order route replaces the billing address) */
	billingAddress: StoreAddress & { email: string };
	email: string;
	phone: string;
	billing: string[];
	shipping: string[];
};

/**
 * The order behind an order-received link (id + key). Guests must also give the billing email, which only the
 * browser that placed the order has (mj_order cookie); null when the order can't be shown here. Amounts are
 * labelled in the currency the order was placed in (the Store API labels them in the request's currency).
 */
export async function getReceivedOrder(id: number, key: string): Promise<ReceivedOrder | null> {
	const saved = await rememberedOrder(id, key);
	if (!saved) return null;

	const query = new URLSearchParams({ key, billing_email: saved.email });
	const res = await wpFetch(`${STORE_API}/order/${id}?${query}`, {
		headers: saved.currency ? { Cookie: `${CURRENCY_COOKIE}=${saved.currency}` } : {},
		cache: "no-store",
	});
	if (!res.ok) {
		await res.body?.cancel();
		return null;
	}
	const order: StoreOrder = await res.json();
	const money = (minor: string) => formatStoreMoney(minor, order.totals);
	const t = order.totals;
	const coupons = order.coupons.map((c) => c.code.toUpperCase()).join(", ");
	const totals = [
		{ label: "Subtotal", value: money(t.subtotal) },
		...(Number(t.total_discount) > 0 ? [{ label: coupons ? `Discount (${coupons})` : "Discount", value: `−${money(t.total_discount)}` }] : []),
		...(order.needs_shipping ? [{ label: "Shipping", value: Number(t.total_shipping) > 0 ? money(t.total_shipping) : "Free" }] : []),
		...(Number(t.total_fees) > 0 ? [{ label: "Fees", value: money(t.total_fees) }] : []),
		...t.tax_lines.map((line) => ({ label: `${decodeEntities(line.name)} (${line.rate})`, value: money(line.price) })),
		...(Number(t.total_refund) > 0 ? [{ label: "Refunded", value: `−${money(t.total_refund)}` }] : []),
		{ label: "Total", value: money(t.total_price) },
	];

	return {
		id: order.id,
		key,
		status: order.status,
		needsPayment: order.needs_payment,
		items: order.items.map((item) => ({
			name: decodeEntities(item.name),
			quantity: item.quantity,
			total: formatStoreMoney(item.totals.line_total, item.totals),
			options: item.variation.map((v) => `${decodeEntities(v.attribute)}: ${decodeEntities(v.value)}`),
			href: new URL(item.permalink).pathname,
			image: item.images[0]?.thumbnail ?? item.images[0]?.src ?? null,
		})),
		totals,
		total: money(t.total_price),
		totalMinor: Number(t.total_price),
		currency: t.currency_code,
		billingAddress: order.billing_address,
		email: order.billing_address.email,
		phone: order.billing_address.phone,
		billing: addressLines(order.billing_address),
		shipping: order.needs_shipping ? addressLines(order.shipping_address) : [],
	};
}

function addressLines(a: StoreAddress): string[] {
	const state = statesOf(a.country)?.[a.state] ?? a.state;
	return [[a.first_name, a.last_name].filter(Boolean).join(" "), a.company, a.address_1, a.address_2, [a.city, state, a.postcode].filter(Boolean).join(", "), a.country ? countryName(a.country) : ""]
		.map((line) => decodeEntities(line ?? "").trim())
		.filter(Boolean);
}

/** A failed checkout as a route handler answer: WooCommerce's own message (stock, address, payment …) */
export function checkoutErrorResponse(error: unknown) {
	if (error instanceof CartError) {
		// 409: the cart changed (stock, price, coupon); the browser reloads it
		return Response.json({ message: error.message, code: error.code, params: error.params, cartChanged: error.status === 409 }, { status: error.status });
	}
	console.error(error);
	return Response.json({ message: "We couldn't place your order. Please try again, or contact us if it keeps happening." }, { status: 502 });
}
