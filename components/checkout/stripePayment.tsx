"use client";

import { useCallback, useImperativeHandle, useRef, useState } from "react";
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
import { LoaderCircle } from "lucide-react";
import type { PaymentData, PlacedOrder } from "@/lib/api/checkout";
import { confirmStripe, goToNextStep, orderReceivedPath, type PaymentHandle } from "@/lib/checkout/client";
import type { CheckoutValues } from "@/lib/checkout/schema";
import { addressOf } from "@/lib/checkout/schema";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
/** The Stripe gateway's Payment Method Configuration (Optimized Checkout), e.g. pmc_…; card + Link without it */
const PMC_ID = process.env.NEXT_PUBLIC_STRIPE_PMC_ID ?? "";

/** True when this deployment can take card payments (the publishable key must match the gateway's mode) */
export const stripeConfigured = Boolean(PUBLISHABLE_KEY);

// Stripe.js loads once, the first time the card form is shown
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => (stripePromise ??= loadStripe(PUBLISHABLE_KEY));

/** "#wc-stripe-confirm-pi:<order>:<client secret>:<nonce>": the gateway's answer when the card needs 3-D Secure */
const CONFIRM_HASH = /#wc-stripe-confirm-(pi|si):(\d+):(.+):(\w+)$/;

/**
 * Card (and Link) payment with the WooCommerce Stripe gateway's deferred intents: the Payment Element turns the
 * card into a PaymentMethod before the order is placed, WooCommerce creates and confirms the PaymentIntent, and
 * when the bank asks for 3-D Secure the customer completes it here before the order is settled.
 */
export function StripePayment({ amount, currency, ref }: { amount: number; currency: string; ref: React.Ref<PaymentHandle> }) {
	const stripeRef = useRef<Stripe | null>(null);
	const elementsRef = useRef<StripeElements | null>(null);
	const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
	// what the element is created with; prepare() brings it up to date before the card is used
	const initial = useRef({ amount, currency });

	// ref callback with a cleanup (React 19): mounts the Payment Element while the card option is shown
	const mount = useCallback((node: HTMLDivElement | null) => {
		if (!node) return;
		let element: { destroy: () => void } | null = null;
		let cancelled = false;
		getStripe()
			.then((stripe) => {
				if (cancelled) return;
				if (!stripe) throw new Error("Stripe.js didn't load");
				const { amount, currency } = initial.current;
				const elements = stripe.elements({
					mode: "payment",
					amount: Math.max(amount, 1),
					currency: currency.toLowerCase(),
					paymentMethodCreation: "manual",
					...(PMC_ID ? { paymentMethodConfiguration: PMC_ID, excludedPaymentMethodTypes: ["amazon_pay"] } : { paymentMethodTypes: ["card", "link"] }),
					appearance: {
						theme: "flat",
						variables: { colorPrimary: "#000000", colorText: "#1c1c1c", colorBackground: "#ffffff", borderRadius: "0px", fontSizeBase: "14px" },
						rules: { ".Input": { border: "1px solid #e4dccf" }, ".Input:focus": { border: "1px solid #000000", boxShadow: "none" } },
					},
				});
				const paymentElement = elements.create("payment", {
					// name, email, address and phone come from the checkout form
					fields: { billingDetails: { name: "never", email: "never", phone: "never", address: "never" } },
					wallets: { applePay: "never", googlePay: "never" },
				});
				paymentElement.on("ready", () => setState("ready"));
				paymentElement.on("loaderror", () => setState("failed"));
				paymentElement.mount(node);
				stripeRef.current = stripe;
				elementsRef.current = elements;
				element = paymentElement;
			})
			.catch(() => setState("failed"));
		return () => {
			cancelled = true;
			element?.destroy();
			elementsRef.current = null;
		};
	}, []);

	useImperativeHandle(
		ref,
		(): PaymentHandle => ({
			async prepare(values: CheckoutValues, total): Promise<PaymentData> {
				const stripe = stripeRef.current;
				const elements = elementsRef.current;
				if (!stripe || !elements) throw new Error("The card form hasn't loaded. Please refresh the page and try again.");
				elements.update({ amount: Math.max(total.amount, 1), currency: total.currency.toLowerCase() });
				const submitted = await elements.submit();
				if (submitted.error) throw new Error(submitted.error.message ?? "Please check your card details.");

				const billing = addressOf(values, values.delivery === "ship" && values.sameBilling ? "s" : "b");
				const { paymentMethod, error } = await stripe.createPaymentMethod({
					elements,
					params: {
						billing_details: {
							name: `${billing.first_name} ${billing.last_name}`.trim(),
							email: values.email,
							phone: billing.phone || null,
							address: { line1: billing.address_1, line2: billing.address_2, city: billing.city, state: billing.state, postal_code: billing.postcode, country: billing.country },
						},
					},
				});
				if (error || !paymentMethod) throw new Error(error?.message ?? "Your card couldn't be used. Please check the details.");
				// the keys the Stripe gateway's block checkout sends (WooCommerce Stripe 11.x)
				return [
					{ key: "payment_method", value: "stripe" },
					{ key: "wc-stripe-payment-method", value: paymentMethod.id },
					{ key: "wc-stripe-new-payment-method", value: "" },
				];
			},

			async complete(order: PlacedOrder) {
				const match = order.paymentDetails.redirect?.match(CONFIRM_HASH);
				if (!match) return goToNextStep(order);
				const stripe = stripeRef.current;
				if (!stripe) throw new Error("The card form hasn't loaded. Please refresh the page and try again.");

				const [, kind, , clientSecret, nonce] = match;
				const returnUrl = new URL("/api/checkout/stripe/", window.location.origin);
				returnUrl.search = new URLSearchParams({ order: String(order.orderId), key: order.orderKey, nonce }).toString();
				const result =
					kind === "si"
						? await stripe.confirmSetup({ clientSecret, redirect: "if_required", confirmParams: { return_url: returnUrl.href } })
						: await stripe.confirmPayment({ clientSecret, redirect: "if_required", confirmParams: { return_url: returnUrl.href } });

				const intent = "setupIntent" in result ? result.setupIntent : "paymentIntent" in result ? result.paymentIntent : undefined;
				const failedIntent = result.error && ("setup_intent" in result.error ? result.error.setup_intent : result.error.payment_intent);
				const intentId = intent?.id ?? failedIntent?.id;
				// the gateway records a failed attempt on the order too, so it can be paid again
				const settled = intentId ? confirmStripe({ orderId: order.orderId, orderKey: order.orderKey, intentId, nonce }) : null;
				if (result.error) {
					await settled?.catch(() => null);
					throw new Error(result.error.message ?? "Your card couldn't be confirmed. Please try again, or use another card.");
				}
				// Stripe has taken the payment: never invite a second one. If WordPress can't be told now, Stripe's
				// webhook settles the order and its order-received page shows it as being confirmed meanwhile.
				const paid = intent && ["succeeded", "processing", "requires_capture"].includes(intent.status);
				const next = await settled?.then((r) => r.redirect).catch(() => null);
				if (next) return window.location.assign(next);
				if (paid) return window.location.assign(orderReceivedPath(order));
				throw new Error("Your card couldn't be confirmed. Please try again, or use another card.");
			},
		}),
		[],
	);

	return (
		<div className="space-y-3">
			<div ref={mount} className={state === "ready" ? undefined : "h-0 overflow-hidden"} />
			{state === "loading" ? (
				<p className="flex items-center gap-2 text-sm text-charcoal" role="status">
					<LoaderCircle className="size-4 animate-spin" aria-hidden />
					Loading the secure card form…
				</p>
			) : null}
			{state === "failed" ? (
				<p className="text-sm text-destructive" role="alert">
					The card form couldn&apos;t load. Please refresh the page, or choose another payment method.
				</p>
			) : null}
		</div>
	);
}
