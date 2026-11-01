import Image from "next/image";
import Link from "next/link";
import type { ReceivedOrder } from "@/lib/api/checkout";

/** Items, totals and addresses of an order (order-received and order-pay), like my-account's view-order */
export function OrderDetails({ order, showAddresses = true }: { order: ReceivedOrder; showAddresses?: boolean }) {
	return (
		<div className="space-y-10">
			<section className="space-y-4">
				<h2 className="text-h4">Order details</h2>
				<ul className="divide-y divide-sand border-y border-sand">
					{order.items.map((item, i) => (
						<li key={i} className="flex gap-4 py-4">
							<div className="relative size-20 shrink-0 overflow-hidden bg-sand-50">
								{item.image ? <Image src={item.image} alt="" fill sizes="80px" className="object-cover" /> : null}
							</div>
							<div className="min-w-0 flex-1 space-y-1">
								<p className="text-sm text-black">
									<Link href={item.href} className="hover:text-gold">
										{item.name}
									</Link>{" "}
									<span className="text-charcoal">× {item.quantity}</span>
								</p>
								{item.options.map((option) => (
									<p key={option} className="text-xs text-charcoal">
										{option}
									</p>
								))}
							</div>
							<p className="text-sm text-black tabular-nums">{item.total}</p>
						</li>
					))}
				</ul>
				<dl className="ml-auto max-w-sm space-y-2 text-sm">
					{order.totals.map((row) => (
						<div key={row.label} className="flex justify-between gap-6 last:border-t last:border-sand last:pt-3 last:text-base last:font-bold last:text-black">
							<dt className="text-charcoal">{row.label}</dt>
							<dd className="text-right tabular-nums">
								{row.label === "Total" ? <span className="mr-1.5 text-xs font-normal text-charcoal">{order.currency}</span> : null}
								{row.value}
							</dd>
						</div>
					))}
				</dl>
			</section>

			{showAddresses ? (
				<section className="grid gap-6 md:grid-cols-2">
					<AddressBlock title="Billing address" lines={[...order.billing, order.phone, order.email].filter(Boolean)} />
					{order.shipping.length ? <AddressBlock title="Shipping address" lines={order.shipping} /> : null}
				</section>
			) : null}
		</div>
	);
}

function AddressBlock({ title, lines }: { title: string; lines: string[] }) {
	return (
		<div className="border border-sand p-6">
			<h3 className="mb-3 text-sm uppercase tracking-button text-black">{title}</h3>
			<address className="space-y-0.5 text-sm not-italic text-charcoal">
				{lines.map((line, i) => (
					<p key={i}>{line}</p>
				))}
			</address>
		</div>
	);
}
