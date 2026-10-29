import type { Metadata } from "next";
import { Suspense } from "react";
import { RoutePlaceholder } from "@/components/common/routePlaceholder";

export async function generateMetadata({ params }: PageProps<"/checkout/order-pay/[orderId]">): Promise<Metadata> {
	const p = await params;
	return { title: `Pay for order #${p.orderId}`, robots: { index: false, follow: false } };
}

/** URL params are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params }: PageProps<"/checkout/order-pay/[orderId]">) {
	return (
		<Suspense fallback={null}>
			<Content params={params} />
		</Suspense>
	);
}

async function Content({ params }: Pick<PageProps<"/checkout/order-pay/[orderId]">, "params">) {
	const p = await params;
	return (
		<div className="space-y-8">
			<h1 className="text-h2">Pay for order</h1>
			<RoutePlaceholder
				variant="inline"
				title={`Order #${p.orderId}`}
				wpPath={`/checkout/order-pay/${p.orderId}/`}
				phase={3}
				detail="WooCommerce customer payment page links sent by email (?pay_for_order=true&key=…)"
			/>
		</div>
	);
}
