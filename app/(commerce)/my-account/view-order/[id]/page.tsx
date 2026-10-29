import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { AccountPage } from "@/components/account/accountPage";
import { OrderStatus } from "@/components/account/orderStatus";
import { getOrder } from "@/lib/api/account";

export const metadata: Metadata = { title: "My account – Order", robots: { index: false, follow: false } };

export default function Page({ params }: PageProps<"/my-account/view-order/[id]">) {
	return (
		<AccountPage>
			{async () => {
				const { id } = await params;
				if (!/^\d+$/.test(id)) notFound();
				const order = await getOrder(Number(id));
				if (!order) notFound();

				return (
					<div className="space-y-10">
						<div className="space-y-3">
							<Link href="/my-account/orders/" className="text-xs text-gold-muted hover:text-black">
								← All orders
							</Link>
							<p className="text-sm text-charcoal">
								Order <span className="text-black">#{order.number}</span> was placed on{" "}
								<span className="text-black">{order.date ? dayjs(order.date).format("MMMM D, YYYY") : "—"}</span> and is currently{" "}
								<OrderStatus status={order.status} label={order.status_label} />
							</p>
							{order.needs_payment ? (
								<Link href={`/checkout/order-pay/${order.id}/?pay_for_order=true&key=${order.order_key}`} className="btn border-black bg-black text-white hover:bg-ink">
									Pay for this order
								</Link>
							) : null}
						</div>

						<section className="space-y-4">
							<h2 className="text-h4">Order details</h2>
							<ul className="divide-y divide-sand border-y border-sand">
								{order.items.map((item, i) => {
									const href = item.slug ? `/product/${item.slug}/` : null;
									return (
										<li key={i} className="flex gap-4 py-4">
											<div className="relative size-20 shrink-0 overflow-hidden bg-sand-50">
												{item.image ? <Image src={item.image} alt="" fill sizes="80px" className="object-cover" /> : null}
											</div>
											<div className="min-w-0 flex-1 space-y-1">
												<p className="text-sm text-black">
													{href ? (
														<Link href={href} className="hover:text-gold">
															{item.name}
														</Link>
													) : (
														item.name
													)}{" "}
													<span className="text-charcoal">× {item.quantity}</span>
												</p>
												{item.meta.map((m) => (
													<p key={m.label} className="text-xs text-charcoal">
														{m.label}: {m.value}
													</p>
												))}
											</div>
											<p className="text-sm text-black">{item.total}</p>
										</li>
									);
								})}
							</ul>
							<dl className="ml-auto max-w-sm space-y-2 text-sm">
								{order.totals.map((row) => (
									<div key={row.label} className="flex justify-between gap-6 last:border-t last:border-sand last:pt-3 last:text-base last:text-black">
										<dt className="text-charcoal">{row.label}</dt>
										<dd className="text-right">{row.value}</dd>
									</div>
								))}
							</dl>
							{order.customer_note ? (
								<p className="bg-sand-50 p-4 text-sm text-charcoal">
									<span className="text-black">Note:</span> {order.customer_note}
								</p>
							) : null}
						</section>

						<section className="grid gap-6 md:grid-cols-2">
							<AddressBlock title="Billing address" lines={[...order.billing, order.phone, order.email].filter(Boolean)} />
							{order.shipping.length ? <AddressBlock title="Shipping address" lines={order.shipping} /> : null}
						</section>
					</div>
				);
			}}
		</AccountPage>
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
