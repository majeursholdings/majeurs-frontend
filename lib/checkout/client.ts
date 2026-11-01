// Browser side of the checkout: the /api/checkout routes (lib/api/checkout.ts on the server)
import type { Cart } from "@/lib/api/cart";
import type { PaymentData, PlacedOrder } from "@/lib/api/checkout";
import type { CheckoutValues } from "./schema";

export class CheckoutRequestError extends Error {
	constructor(
		message: string,
		/** WooCommerce's invalid_params: field -> message */
		public params?: Record<string, string>,
		/** the cart changed under the shopper (stock, price, coupon): reload it */
		public cartChanged = false,
	) {
		super(message);
	}
}

async function post<T>(url: string, body: unknown): Promise<T> {
	const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
	const data = await res.json().catch(() => null);
	if (!res.ok) throw new CheckoutRequestError(data?.message ?? "Something went wrong. Please try again.", data?.params, Boolean(data?.cartChanged));
	return data as T;
}

export const saveAddress = (input: { shipping_address?: Record<string, string>; billing_address?: Record<string, string> }) =>
	post<Cart>("/api/checkout/customer/", input);

export const chooseShippingRate = (packageId: number, rateId: string) => post<Cart>("/api/checkout/shipping/", { packageId, rateId });

export const submitOrder = (values: CheckoutValues, paymentData: PaymentData, expectedTotal: number) =>
	post<PlacedOrder>("/api/checkout/", { values, paymentData, expectedTotal });

/** Pays for an existing order (order-pay page) */
export const payOrder = (input: { orderId: number; orderKey: string; paymentMethod: string; paymentData: PaymentData }) => post<PlacedOrder>("/api/checkout/pay/", input);

/** Opens an order from its email link in a browser that didn't place it */
export const unlockOrder = (input: { orderId: number; orderKey: string; email: string }) => post<{ ok: true }>("/api/checkout/unlock/", input);

/** After Stripe's 3-D Secure step in the page: settles the order, answers where to go next */
export const confirmStripe = (input: { orderId: number; orderKey: string; intentId: string; nonce: string }) => post<{ redirect: string }>("/api/checkout/stripe/", input);

/** Our order-received page for an order, when the gateway gives no redirect of its own */
export const orderReceivedPath = (order: Pick<PlacedOrder, "orderId" | "orderKey">) => `/checkout/order-received/${order.orderId}/?key=${encodeURIComponent(order.orderKey)}`;

/**
 * What a payment method's component exposes to the Place order button. `prepare` runs before the order is
 * placed (e.g. Stripe turns the card into a PaymentMethod) and returns the payment_data to send;
 * `complete` runs once WooCommerce has answered (e.g. redirect to Paystack, or Stripe's 3-D Secure step).
 */
export type PaymentHandle = {
	/** `total`: the order total now (minor units) and its currency */
	prepare?: (values: CheckoutValues, total: { amount: number; currency: string }) => Promise<PaymentData>;
	complete?: (order: PlacedOrder) => Promise<void>;
};

/** Default next step: the gateway's page, else our order-received page. A full load, so the cart starts fresh. */
export function goToNextStep(order: PlacedOrder) {
	window.location.assign(order.redirectUrl && !order.redirectUrl.startsWith("#") ? order.redirectUrl : orderReceivedPath(order));
}
