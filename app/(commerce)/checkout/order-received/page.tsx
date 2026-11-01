import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { CUSTOMER_SERVICE_EMAIL, CUSTOMER_SERVICE_PHONE } from "@/lib/contact";

export const metadata: Metadata = { title: "Order received", robots: { index: false, follow: false } };

/**
 * /checkout/order-received/ with no order: where Paystack's callback lands when WordPress couldn't verify the
 * payment with Paystack. The order itself is settled later (Paystack's webhook) and emailed.
 */
export default function Page() {
	return (
		<div className="mx-auto max-w-3xl space-y-6 px-2.5">
			<CircleCheck className="size-10 text-gold" strokeWidth={1.25} aria-hidden />
			<h1 className="text-h2">Thank you for your order.</h1>
			<p className="text-sm text-charcoal">
				We’re confirming your payment and will email you as soon as it’s done. If you don’t hear from us within the hour, call{" "}
				<a href={CUSTOMER_SERVICE_PHONE.href} className="whitespace-nowrap text-bronze underline underline-offset-2 hover:text-gold">
					{CUSTOMER_SERVICE_PHONE.label}
				</a>{" "}
				or email{" "}
				<a href={`mailto:${CUSTOMER_SERVICE_EMAIL}`} className="break-all text-bronze underline underline-offset-2 hover:text-gold">
					{CUSTOMER_SERVICE_EMAIL}
				</a>
				.
			</p>
			<Link href="/shop/" className="btn w-fit border-ink text-ink hover:bg-ink hover:text-sand">
				Continue shopping
			</Link>
		</div>
	);
}
