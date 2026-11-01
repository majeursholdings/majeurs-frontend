"use client";

import { CreditCard, Lock } from "lucide-react";
import type { PaymentHandle } from "@/lib/checkout/client";
import { cn } from "@/lib/utils";
import { StripePayment, stripeConfigured } from "./stripePayment";

/** Currencies Paystack can charge (woo-paystack's supported list); it can't take GBP or EUR */
const PAYSTACK_CURRENCIES = new Set(["NGN", "USD", "ZAR", "GHS", "KES", "XOF", "EGP", "RWF"]);

type Method = { id: string; title: string; description: string };

const METHODS: Method[] = [
	{ id: "paystack", title: "Paystack", description: "Pay with your debit or credit card, bank transfer or USSD. You’ll finish paying on Paystack’s secure page." },
	{ id: "stripe", title: "Credit / Debit Card", description: "Visa, Mastercard, American Express and Link, processed securely by Stripe." },
];

/** The payment methods to offer: what WooCommerce lists for this cart, that this site can take, in WP's order */
export function availableMethods(gateways: string[], currency: string): Method[] {
	return METHODS.filter((m) => gateways.includes(m.id))
		.filter((m) => m.id !== "paystack" || PAYSTACK_CURRENCIES.has(currency))
		.filter((m) => m.id !== "stripe" || stripeConfigured);
}

/**
 * Payment options. The chosen method's form (Stripe's card element) shows under it, and `handleRef` gets its
 * prepare / complete steps for the Place order button.
 */
export function PaymentMethods({
	methods,
	value,
	onChange,
	amount,
	currency,
	handleRef,
	disabled,
}: {
	methods: Method[];
	value: string;
	onChange: (id: string) => void;
	amount: number;
	currency: string;
	handleRef: React.Ref<PaymentHandle>;
	disabled?: boolean;
}) {
	if (!methods.length) {
		return (
			<p className="border border-sand bg-sand-50 p-4 text-sm text-charcoal" role="alert">
				Online payment isn’t available for {currency} orders right now. Switch currency in the header, or order via WhatsApp and we’ll arrange payment.
			</p>
		);
	}

	return (
		<div className="space-y-3">
			<div role="radiogroup" aria-label="Payment method" className="divide-y divide-sand border border-sand">
				{methods.map((method) => {
					const selected = value === method.id;
					return (
						<div key={method.id} className={cn("transition-colors duration-150", selected && "bg-sand-50")}>
							<label className={cn("flex cursor-pointer gap-3 p-4", disabled && "pointer-events-none opacity-60")}>
								<input
									type="radio"
									name="payment-method"
									value={method.id}
									checked={selected}
									disabled={disabled}
									onChange={() => onChange(method.id)}
									className="mt-0.5 size-4 shrink-0 accent-black"
								/>
								<span className="min-w-0 flex-1 space-y-1 text-sm">
									<span className="flex items-center justify-between gap-3">
										<span className="font-bold text-black">{method.title}</span>
										<CreditCard className="size-5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
									</span>
									<span className="block text-xs text-charcoal">{method.description}</span>
								</span>
							</label>
							{selected && method.id === "stripe" ? (
								<div className="px-4 pb-4">
									<StripePayment amount={amount} currency={currency} ref={handleRef} />
								</div>
							) : null}
						</div>
					);
				})}
			</div>
			<p className="flex items-center gap-1.5 text-xs text-charcoal">
				<Lock className="size-3.5" aria-hidden />
				Payments are encrypted. We never see or store your card details.
			</p>
		</div>
	);
}
