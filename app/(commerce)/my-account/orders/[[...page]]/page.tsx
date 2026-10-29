import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { AccountPage } from "@/components/account/accountPage";
import { OrderStatus } from "@/components/account/orderStatus";
import { Pagination } from "@/components/shop/pagination";
import { getOrders } from "@/lib/api/account";

export const metadata: Metadata = { title: "My account – Orders", robots: { index: false, follow: false } };

/** /my-account/orders/ and its WooCommerce pages /my-account/orders/2/ */
export default function Page({ params }: PageProps<"/my-account/orders/[[...page]]">) {
	return (
		<AccountPage>
			{async () => {
				// WooCommerce links /orders/2/; the shared Pagination links /orders/page/2/
				const { page: segments = [] } = await params;
				const number = segments[0] === "page" ? segments.slice(1) : segments;
				if (number.length > 1 || (number[0] && !/^\d+$/.test(number[0]))) notFound();
				const page = Number(number[0] ?? 1);
				const { orders, pages } = await getOrders(page);
				if (page > 1 && !orders.length) notFound();

				if (!orders.length) {
					return (
						<div className="flex flex-col items-start gap-4 border border-sand bg-sand-50 p-6">
							<p className="text-sm text-charcoal">No order has been made yet.</p>
							<Link href="/shop/" className="btn border-black bg-black text-white hover:bg-ink">
								Browse products
							</Link>
						</div>
					);
				}

				return (
					<div className="space-y-8">
						<table className="w-full text-sm">
							<thead className="hidden border-b border-black text-left text-xs uppercase tracking-button text-black md:table-header-group">
								<tr>
									<th className="py-3 font-normal">Order</th>
									<th className="py-3 font-normal">Date</th>
									<th className="py-3 font-normal">Status</th>
									<th className="py-3 font-normal">Total</th>
									<th className="py-3 font-normal">
										<span className="sr-only">Actions</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((o) => (
									<tr key={o.id} className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-sand py-4 md:table-row md:py-0">
										<td className="md:py-4">
											<Link href={`/my-account/view-order/${o.id}/`} className="text-black hover:text-gold">
												#{o.number}
											</Link>
										</td>
										<td className="text-right text-charcoal md:py-4 md:text-left">{o.date ? dayjs(o.date).format("MMMM D, YYYY") : "—"}</td>
										<td className="md:py-4">
											<OrderStatus status={o.status} label={o.status_label} />
										</td>
										<td className="text-right text-charcoal md:py-4 md:text-left">
											<span className="text-black">{o.total}</span> for {o.item_count} {o.item_count === 1 ? "item" : "items"}
										</td>
										<td className="col-span-2 flex justify-end gap-2 pt-2 md:py-4">
											{o.needs_payment ? (
												<Link
													href={`/checkout/order-pay/${o.id}/?pay_for_order=true&key=${o.order_key}`}
													className="btn px-4 py-2 text-xs border-black bg-black text-white hover:bg-ink"
												>
													Pay
												</Link>
											) : null}
											<Link href={`/my-account/view-order/${o.id}/`} className="btn px-4 py-2 text-xs border-black text-black hover:bg-black hover:text-white">
												View
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<Pagination page={page} totalPages={pages} basePath="/my-account/orders/" />
					</div>
				);
			}}
		</AccountPage>
	);
}
