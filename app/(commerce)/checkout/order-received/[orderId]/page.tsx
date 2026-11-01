import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CircleCheck, Clock, CircleAlert } from "lucide-react";
import { OrderDetails } from "@/components/checkout/orderDetails";
import { getReceivedOrder, type ReceivedOrder } from "@/lib/api/checkout";
import { CUSTOMER_SERVICE_EMAIL, CUSTOMER_SERVICE_PHONE, PRODUCTION_TIME, whatsappLink } from "@/lib/contact";

export async function generateMetadata({ params }: PageProps<"/checkout/order-received/[orderId]">): Promise<Metadata> {
	const p = await params;
	return { title: `Order received #${p.orderId}`, robots: { index: false, follow: false } };
}

/** URL params are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params, searchParams }: PageProps<"/checkout/order-received/[orderId]">) {
	return (
		<div className="mx-auto max-w-3xl space-y-10 px-2.5">
			<Suspense fallback={<div className="h-64 animate-pulse bg-sand-50" aria-busy="true" aria-label="Loading your order" />}>
				<Content params={params} searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

async function Content({ params, searchParams }: Pick<PageProps<"/checkout/order-received/[orderId]">, "params" | "searchParams">) {
	const [{ orderId }, query] = await Promise.all([params, searchParams]);
	const key = Array.isArray(query.key) ? query.key[0] : query.key;
	const id = /^\d+$/.test(orderId) ? Number(orderId) : null;
	// the cart is forgotten on the way in (proxy.ts); the order is shown to the browser that placed it
	const order = id && key ? await getReceivedOrder(id, key) : null;

	if (!order) {
		return (
			<>
				<Heading icon="done" title="Thank you. Your order has been received." />
				<p className="text-sm text-charcoal">
					{id ? (
						<>
							Your order number is <span className="text-black">#{id}</span>.{" "}
						</>
					) : null}
					We’ve emailed you a confirmation with your order details. If it doesn’t arrive within a few minutes, check your spam folder or contact us.
				</p>
				<NextSteps />
			</>
		);
	}

	return (
		<>
			<OrderStatusMessage order={order} />
			<dl className="grid grid-cols-2 gap-px bg-sand text-sm sm:grid-cols-3">
				<Fact label="Order number" value={`#${order.id}`} />
				<Fact label="Total" value={order.total} />
				<Fact label="Email" value={order.email} className="col-span-2 sm:col-span-1" />
			</dl>
			<OrderDetails order={order} />
			<NextSteps />
		</>
	);
}

/** What the customer needs to know, by order status (Paystack and Stripe settle orders before sending them here) */
function OrderStatusMessage({ order }: { order: ReceivedOrder }) {
	const payAgain = `/checkout/order-pay/${order.id}/?pay_for_order=true&key=${encodeURIComponent(order.key)}`;
	switch (order.status) {
		case "failed":
			return (
				<>
					<Heading icon="problem" title="Your payment didn’t go through." />
					<p className="text-sm text-charcoal">Your order is saved, but we haven’t received payment for it. You haven’t been charged. You can try again with the same or another payment method.</p>
					<Link href={payAgain} className="btn w-fit border-black bg-black text-white hover:border-gold hover:bg-gold">
						Pay for this order
					</Link>
				</>
			);
		case "pending":
			return (
				<>
					<Heading icon="waiting" title="We’re confirming your payment." />
					<p className="text-sm text-charcoal">
						This usually takes a few seconds. We’ll email you as soon as it’s confirmed. If you didn’t finish paying, you can{" "}
						<Link href={payAgain} className="text-bronze underline underline-offset-2 hover:text-gold">
							pay for this order
						</Link>{" "}
						now.
					</p>
				</>
			);
		case "on-hold":
			return (
				<>
					<Heading icon="done" title="Thank you. Your order has been received." />
					<p className="text-sm text-charcoal">We’re checking your payment and will be in touch shortly to confirm your order. We’ve emailed you the details.</p>
					<WhatHappensNext />
				</>
			);
		case "cancelled":
			return <Heading icon="problem" title="This order was cancelled." />;
		default:
			return (
				<>
					<Heading icon="done" title="Thank you. Your order has been received." />
					<p className="text-sm text-charcoal">We’ve emailed your confirmation to {order.email}.</p>
					<WhatHappensNext />
				</>
			);
	}
}

/** Made to order: what the customer can expect after paying */
function WhatHappensNext() {
	return (
		<ol className="space-y-3 border border-sand p-6 text-sm text-charcoal">
			<li>
				<span className="text-black">Made for you.</span> Every piece is made to order in our Lagos workshop. Production takes {PRODUCTION_TIME} per product, and
				we’ll email you updates along the way.
			</li>
			<li>
				<span className="text-black">Delivery or collection.</span> When your order is ready, our customer care team will contact you to arrange delivery or
				showroom pickup, and we’ll send tracking details once it ships.
			</li>
		</ol>
	);
}

function Heading({ icon, title }: { icon: "done" | "waiting" | "problem"; title: string }) {
	const Icon = icon === "done" ? CircleCheck : icon === "waiting" ? Clock : CircleAlert;
	return (
		<div className="space-y-4">
			<Icon className={icon === "problem" ? "size-10 text-destructive" : "size-10 text-gold"} strokeWidth={1.25} aria-hidden />
			<h1 className="text-h2">{title}</h1>
		</div>
	);
}

function Fact({ label, value, className }: { label: string; value: string; className?: string }) {
	return (
		<div className={`space-y-1 bg-white p-4 ${className ?? ""}`}>
			<dt className="text-xs uppercase tracking-button text-charcoal">{label}</dt>
			<dd className="break-all text-black">{value}</dd>
		</div>
	);
}

function NextSteps() {
	return (
		<div className="space-y-5 border-t border-sand pt-8">
			<p className="text-sm text-charcoal">
				Questions about your order? Call{" "}
				<a href={CUSTOMER_SERVICE_PHONE.href} className="whitespace-nowrap text-bronze underline underline-offset-2 hover:text-gold">
					{CUSTOMER_SERVICE_PHONE.label}
				</a>
				, email{" "}
				<a href={`mailto:${CUSTOMER_SERVICE_EMAIL}`} className="break-all text-bronze underline underline-offset-2 hover:text-gold">
					{CUSTOMER_SERVICE_EMAIL}
				</a>{" "}
				or{" "}
				<a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-bronze underline underline-offset-2 hover:text-gold">
					message us on WhatsApp
				</a>
				.
			</p>
			<Link href="/shop/" className="btn w-fit border-ink text-ink hover:bg-ink hover:text-sand">
				Continue shopping
			</Link>
		</div>
	);
}
