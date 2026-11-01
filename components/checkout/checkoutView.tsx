"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { FormProvider, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { AlertCircle, ChevronDown, LoaderCircle, Lock } from "lucide-react";
import { FormField } from "@/components/customForm";
import { useCart } from "@/components/providers/cartProvider";
import { CartUnavailable } from "@/components/shop/cartUnavailable";
import { trackEvent } from "@/lib/analytics";
import type { Cart, StoreAddress } from "@/lib/api/cart";
import { DEFAULT_COUNTRY, statesOf } from "@/lib/checkout/countries";
import { CheckoutRequestError, chooseShippingRate, goToNextStep, saveAddress, submitOrder, type PaymentHandle } from "@/lib/checkout/client";
import { ADDRESS_FIELDS, addressOf, canQuoteShipping, checkoutSchema, type CheckoutInput, type CheckoutValues } from "@/lib/checkout/schema";
import { cn } from "@/lib/utils";
import { AddressFields } from "./addressFields";
import { DeliveryToggle, RateOptions, rateChoices } from "./deliveryOptions";
import { OrderSummary } from "./orderSummary";
import { PaymentMethods, availableMethods } from "./paymentMethods";

/** Checkout page body: waits for the cart, then the form (or the empty-cart state) */
export function CheckoutView({ paymentFailed = false }: { paymentFailed?: boolean }) {
	const { cart, loadFailed, reload } = useCart();
	if (!cart && loadFailed) return <CartUnavailable onRetry={reload} />;
	if (!cart) return <CheckoutSkeleton />;
	if (!cart.items.length) return <EmptyCheckout />;
	return <CheckoutForm initialCart={cart} paymentFailed={paymentFailed} />;
}

function defaultsFrom(cart: Cart): CheckoutInput {
	const group = (prefix: "s" | "b", address: StoreAddress) =>
		Object.fromEntries([...ADDRESS_FIELDS.map((f) => [`${prefix}_${f}`, address[f] ?? ""]), [`${prefix}_country`, address.country || DEFAULT_COUNTRY]]);
	const pickupChosen = cart.shippingPackages.some((pkg) => pkg.rates.some((rate) => rate.selected && rate.pickup));
	return {
		email: cart.billingAddress.email ?? "",
		// nothing to deliver: like pickup, only the billing address is asked for (and checked)
		delivery: pickupChosen || !cart.needsShipping ? "pickup" : "ship",
		sameBilling: true,
		note: "",
		newsletter: true,
		payment_method: "",
		...group("s", cart.shippingAddress),
		...group("b", cart.billingAddress),
	} as CheckoutInput;
}

const quoteKey = (values: Partial<Record<string, unknown>>) => JSON.stringify(addressOf(values, "s"));

function CheckoutForm({ initialCart, paymentFailed }: { initialCart: Cart; paymentFailed: boolean }) {
	const { cart: liveCart, sync } = useCart();
	const cart = liveCart ?? initialCart;
	const methods = useForm<CheckoutInput, unknown, CheckoutValues>({
		mode: "onTouched",
		resolver: zodResolver(checkoutSchema),
		defaultValues: defaultsFrom(initialCart),
	});
	const { control, setValue, handleSubmit, register, getValues, formState } = methods;
	const values = useWatch({ control }) as Partial<CheckoutInput>;
	const delivery = values.delivery ?? "ship";

	const [quoting, setQuoting] = useState(false);
	const [rateBusy, setRateBusy] = useState(false);
	const [placing, setPlacing] = useState(false);
	const [showNote, setShowNote] = useState(false);
	const [summaryOpen, setSummaryOpen] = useState(false);
	const paymentHandle = useRef<PaymentHandle>(null);
	// the shipping address WooCommerce last priced, so retyping the same address doesn't ask again
	const quoted = useRef(initialCart.shipping !== null ? quoteKey(defaultsFrom(initialCart)) : "");

	const shipChoices = rateChoices(cart, false);
	const pickupChoices = rateChoices(cart, true);
	const offersPickup = pickupChoices.length > 0;
	const canQuote = canQuoteShipping(values);

	const gateways = availableMethods(cart.paymentMethods, cart.currency);
	const paymentMethod = gateways.some((g) => g.id === values.payment_method) ? values.payment_method! : (gateways[0]?.id ?? "");

	/** Picks a rate; answers the updated cart, or null when WooCommerce refused */
	const selectRate = useCallback(
		async (packageId: number, rateId: string) => {
			setRateBusy(true);
			try {
				const next = await chooseShippingRate(packageId, rateId);
				sync(next);
				return next;
			} catch (error) {
				toast.error((error as Error).message);
				return null;
			} finally {
				setRateBusy(false);
			}
		},
		[sync],
	);

	/** Delivered orders: a delivery rate, not the showroom, should be the one selected */
	const preferDelivery = useCallback(
		async (next: Cart) => {
			const choices = rateChoices(next, false);
			if (choices.length && !choices.some((c) => c.rate.selected)) await selectRate(choices[0].packageId, choices[0].rate.id);
		},
		[selectRate],
	);

	const quote = useDebouncedCallback(async (snapshot: Partial<CheckoutInput>) => {
		const key = quoteKey(snapshot);
		if (key === quoted.current) return;
		quoted.current = key;
		setQuoting(true);
		try {
			const next = await saveAddress({ shipping_address: addressOf(snapshot, "s") });
			sync(next);
			if (getValues("delivery") === "ship") await preferDelivery(next);
		} catch (error) {
			quoted.current = "";
			toast.error((error as Error).message);
		} finally {
			setQuoting(false);
		}
	}, 700);

	// ref callback with a cleanup (React 19): reacts to typing while the form is mounted
	const watchForm = useCallback(
		(form: HTMLFormElement | null) => {
			if (!form) return;
			const countries = { s: getValues("s_country"), b: getValues("b_country") };
			return methods.subscribe({
				formState: { values: true },
				callback: ({ values: next, name }) => {
					// a state picked from the old country's list means nothing in the new one
					for (const prefix of ["s", "b"] as const) {
						const country = next[`${prefix}_country`] ?? "";
						if (country === countries[prefix]) continue;
						countries[prefix] = country;
						const state = next[`${prefix}_state`] ?? "";
						const states = statesOf(country);
						if (state && (!states || !(state in states))) setValue(`${prefix}_state`, "");
					}
					if (name?.startsWith("s_") && next.delivery === "ship" && canQuoteShipping(next)) quote(next);
				},
			});
		},
		[methods, getValues, setValue, quote],
	);

	const changeDelivery = async (next: "ship" | "pickup") => {
		setValue("delivery", next);
		if (next === "pickup") {
			const choice = pickupChoices.find((c) => c.rate.selected) ?? pickupChoices[0];
			if (choice && !choice.rate.selected) await selectRate(choice.packageId, choice.rate.id);
			return;
		}
		if (shipChoices.length) await preferDelivery(cart);
		else if (canQuoteShipping(getValues())) {
			quoted.current = "";
			quote(getValues());
		}
	};

	const onSubmit = async (form: CheckoutValues) => {
		if (cart.needsShipping) {
			const ready = (form.delivery === "pickup" ? pickupChoices : shipChoices).some((c) => c.rate.selected);
			if (!ready) {
				toast.error(form.delivery === "pickup" ? "Choose a pickup location." : "Choose a delivery option for your address.");
				return;
			}
		}
		const order = { ...form, payment_method: paymentMethod };
		setPlacing(true);
		try {
			const handle = paymentMethod === "stripe" ? paymentHandle.current : null;
			const paymentData = (await handle?.prepare?.(order, { amount: cart.totalMinor, currency: cart.currency })) ?? [];
			const placed = await submitOrder(order, paymentData, cart.totalMinor);
			trackEvent({ event: "form_submit", form_name: "checkout" });
			await (handle?.complete ? handle.complete(placed) : goToNextStep(placed));
			// the browser is on its way to the next page; keep the button disabled
		} catch (error) {
			setPlacing(false);
			toast.error((error as Error).message);
			if (error instanceof CheckoutRequestError && error.cartChanged) {
				const res = await fetch("/api/cart/");
				if (res.ok) sync(await res.json());
			}
		}
	};

	/** Validation failed: say so, even when the field at fault isn't on screen, so the button never seems dead */
	const onInvalid = (errors: FieldErrors<CheckoutInput>) => {
		const first = Object.values(errors).find((e) => e?.message)?.message;
		toast.error(first ? `Please check your details: ${first}` : "Please check your details.");
	};

	const blocked = cart.errors.length > 0;
	const busy = placing || rateBusy;

	return (
		<FormProvider {...methods}>
			<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-14">
				<aside aria-labelledby="checkout-summary-title" className="h-fit bg-sand-50 lg:sticky lg:top-28 lg:order-last">
					{/* below lg the summary folds away behind this button; on desktop it's always open, under a plain heading */}
					<button
						type="button"
						onClick={() => setSummaryOpen((open) => !open)}
						aria-expanded={summaryOpen}
						aria-controls="checkout-summary"
						className="flex w-full items-center justify-between gap-3 p-5 text-left lg:hidden"
					>
						<span className="flex items-center gap-2 text-sm font-bold uppercase tracking-button">
							Order summary
							<ChevronDown className={cn("size-4 transition-transform duration-200", summaryOpen && "rotate-180")} aria-hidden />
						</span>
						<span className="text-base font-bold text-black tabular-nums">{cart.total}</span>
					</button>
					<h2 id="checkout-summary-title" className="hidden px-6 pt-6 text-sm font-bold uppercase tracking-button lg:block">
						Order summary
					</h2>
					<div id="checkout-summary" className={cn("px-5 pb-5 lg:block lg:p-6", !summaryOpen && "hidden")}>
						<OrderSummary cart={cart} delivery={delivery} />
					</div>
				</aside>

				<form ref={watchForm} onSubmit={(event) => handleSubmit(onSubmit, onInvalid)(event)} noValidate className="space-y-10" aria-busy={placing}>
					{paymentFailed ? <Alert>Your payment didn&apos;t go through and you haven&apos;t been charged. Please try again, or choose another payment method.</Alert> : null}
					{blocked ? (
						<Alert>
							{cart.errors.join(" ")}{" "}
							<Link href="/cart/" className="underline underline-offset-2">
								Review your cart
							</Link>
						</Alert>
					) : null}

					<fieldset disabled={placing} className="space-y-10">
						<Section title="Contact information" description="We’ll email your order confirmation and delivery updates here.">
							<FormField<CheckoutInput>
								field={{ name: "email", type: "email", label: "Email address", autoComplete: "email", validation: { required: true } }}
								register={register}
								control={control}
								getValues={getValues}
								setValue={setValue}
								errors={formState.errors}
							/>
							<FormField<CheckoutInput>
								field={{ name: "newsletter", type: "checkbox", label: "I want to receive updates about products and promotions." }}
								register={register}
								control={control}
								getValues={getValues}
								errors={formState.errors}
							/>
						</Section>

						{cart.needsShipping && offersPickup ? (
							<Section title="Delivery">
								<DeliveryToggle value={delivery} onChange={changeDelivery} disabled={busy} />
							</Section>
						) : null}

						{cart.needsShipping && delivery === "ship" ? (
							<>
								<Section title="Shipping address">
									<AddressFields prefix="s" shippingOnly />
								</Section>
								<Section title="Delivery options">
									<RateOptions choices={shipChoices} pickup={false} quoting={quoting} canQuote={canQuote} busy={rateBusy} onSelect={(c) => selectRate(c.packageId, c.rate.id)} />
								</Section>
							</>
						) : null}

						{cart.needsShipping && delivery === "pickup" ? (
							<Section title="Pickup location" description="We’ll call you when your order is ready to collect.">
								<RateOptions choices={pickupChoices} pickup quoting={false} canQuote busy={rateBusy} onSelect={(c) => selectRate(c.packageId, c.rate.id)} />
							</Section>
						) : null}

						<Section title="Billing address">
							{cart.needsShipping && delivery === "ship" ? (
								<FormField<CheckoutInput>
									field={{ name: "sameBilling", type: "checkbox", label: "Use the shipping address for billing" }}
									register={register}
									control={control}
									getValues={getValues}
									errors={formState.errors}
								/>
							) : null}
							{delivery === "pickup" || !cart.needsShipping || values.sameBilling === false ? <AddressFields prefix="b" /> : null}
						</Section>

						<Section title="Payment">
							<PaymentMethods
								methods={gateways}
								value={paymentMethod}
								onChange={(id) => setValue("payment_method", id)}
								amount={cart.totalMinor}
								currency={cart.currency}
								handleRef={paymentHandle}
								disabled={placing}
							/>
						</Section>

						<div className="space-y-3">
							<label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
								<input type="checkbox" checked={showNote} onChange={(e) => setShowNote(e.target.checked)} className="size-4 accent-black" />
								Add a note to your order
							</label>
							{showNote ? (
								<FormField<CheckoutInput>
									field={{ name: "note", type: "textarea", label: "Order note", placeholder: "Delivery instructions, access details or anything else we should know", rows: 3 }}
									register={register}
									control={control}
									getValues={getValues}
									errors={formState.errors}
								/>
							) : null}
						</div>
					</fieldset>

					<div className="space-y-4 border-t border-sand pt-6">
						<p className="text-xs text-charcoal">
							By placing your order you agree to our{" "}
							<Link href="/terms-of-use/" className="text-bronze underline underline-offset-2 hover:text-gold">
								Terms of Use
							</Link>{" "}
							and{" "}
							<Link href="/privacy-policy/" className="text-bronze underline underline-offset-2 hover:text-gold">
								Privacy Policy
							</Link>
							.
						</p>
						<button
							type="submit"
							disabled={busy || quoting || blocked || (cart.needsPayment && !paymentMethod)}
							className="btn w-full border-black bg-black text-white hover:border-gold hover:bg-gold disabled:opacity-60"
						>
							{placing ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
							{placing ? "Placing your order…" : `Place order · ${cart.total}`}
						</button>
						<Link href="/cart/" className="block text-center text-sm text-bronze underline-offset-4 hover:underline">
							Return to cart
						</Link>
					</div>
				</form>
			</div>
		</FormProvider>
	);
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
	return (
		<section className="space-y-4">
			<div className="space-y-1">
				<h2 className="text-sm font-bold uppercase tracking-button text-black">{title}</h2>
				{description ? <p className="text-xs text-charcoal">{description}</p> : null}
			</div>
			{children}
		</section>
	);
}

function Alert({ children }: { children: React.ReactNode }) {
	return (
		<div role="alert" className="flex gap-3 border border-destructive/40 bg-destructive/5 p-4 text-sm text-ink">
			<AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
			<p>{children}</p>
		</div>
	);
}

function EmptyCheckout() {
	return (
		<div className="flex flex-col items-center gap-3 py-16 text-center">
			<p className="text-h4">Your cart is empty</p>
			<p className="max-w-md text-sm text-charcoal">Add a piece to your cart to check out.</p>
			<Link href="/shop/" className="btn mt-5 border-black bg-black text-white hover:border-gold hover:bg-gold">
				Browse the shop
			</Link>
		</div>
	);
}

/** Same shape as the form, so nothing jumps when the cart arrives */
function CheckoutSkeleton() {
	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14" aria-busy="true" aria-label="Loading checkout">
			<div className="h-16 animate-pulse bg-sand-50 lg:order-last lg:h-96" />
			<div className="space-y-8">
				{Array.from({ length: 3 }, (_, i) => (
					<div key={i} className="space-y-3">
						<div className="h-4 w-40 animate-pulse bg-sand-50" />
						<div className="h-11 animate-pulse bg-sand-50" />
						<div className="h-11 animate-pulse bg-sand-50" />
					</div>
				))}
			</div>
		</div>
	);
}
