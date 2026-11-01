import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { OrderDetails } from "@/components/checkout/orderDetails";
import { OrderAccessForm, PayForOrder } from "@/components/checkout/payForOrder";
import { getReceivedOrder, orderReceivedPath } from "@/lib/api/checkout";

export async function generateMetadata({ params }: PageProps<"/checkout/order-pay/[orderId]">): Promise<Metadata> {
	const p = await params;
	return { title: `Pay for order #${p.orderId}`, robots: { index: false, follow: false } };
}

/** URL params are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params, searchParams }: PageProps<"/checkout/order-pay/[orderId]">) {
	return (
		<div className="mx-auto max-w-3xl space-y-10 px-2.5">
			<Suspense fallback={<div className="h-64 animate-pulse bg-sand-50" aria-busy="true" aria-label="Loading your order" />}>
				<Content params={params} searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

/**
 * /checkout/order-pay/<id>/?pay_for_order=true&key=wc_order_…: "Pay for this order" from emails and my-account,
 * and a retry after a failed payment. Store API pay-for-order route (lib/api/checkout.ts).
 */
async function Content({ params, searchParams }: Pick<PageProps<"/checkout/order-pay/[orderId]">, "params" | "searchParams">) {
	const [{ orderId }, query] = await Promise.all([params, searchParams]);
	const key = Array.isArray(query.key) ? query.key[0] : query.key;
	const id = /^\d+$/.test(orderId) ? Number(orderId) : null;

	if (!id || !key?.startsWith("wc_order_")) {
		return <Problem title="This payment link isn't complete." text="Please use the “Pay for this order” link from your order email, or contact us." />;
	}

	const order = await getReceivedOrder(id, key);
	if (!order) {
		return (
			<>
				<h1 className="text-h2">Pay for order #{id}</h1>
				<p className="text-sm text-charcoal">To keep your order private, please confirm the email address you used for it.</p>
				<div className="max-w-md">
					<OrderAccessForm orderId={id} orderKey={key} />
				</div>
			</>
		);
	}

	if (!order.needsPayment) {
		// WooCommerce only takes payment for pending and failed orders; the rest are paid, or closed (an unpaid order
		// is cancelled once its stock hold runs out)
		if (["processing", "completed", "on-hold"].includes(order.status)) {
			return (
				<>
					<h1 className="text-h2">Order #{order.id} is already paid.</h1>
					<Link href={orderReceivedPath(order.id, key)} className="btn w-fit border-black bg-black text-white hover:border-gold hover:bg-gold">
						View your order
					</Link>
				</>
			);
		}
		return (
			<Problem
				title={`Order #${order.id} can no longer be paid.`}
				text={
					order.status === "cancelled"
						? "It was cancelled because payment wasn’t completed in time, and you haven’t been charged. Please place a new order, or contact us and we’ll help."
						: "Please contact us and we’ll help you with it."
				}
			>
				<Link href="/shop/" className="btn w-fit border-black bg-black text-white hover:border-gold hover:bg-gold">
					Browse the shop
				</Link>
			</Problem>
		);
	}

	return (
		<>
			<div className="space-y-3">
				<h1 className="text-h2">Pay for order #{order.id}</h1>
				<p className="text-sm text-charcoal">Your order is saved. Choose how you’d like to pay {order.total}.</p>
			</div>
			<OrderDetails order={order} showAddresses={false} />
			<PayForOrder orderId={order.id} orderKey={key} total={order.total} totalMinor={order.totalMinor} currency={order.currency} billingAddress={order.billingAddress} />
		</>
	);
}

function Problem({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
	return (
		<>
			<h1 className="text-h2">{title}</h1>
			<p className="text-sm text-charcoal">{text}</p>
			{children}
		</>
	);
}
