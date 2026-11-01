"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/providers/cartProvider";
import { CouponForm } from "@/components/shop/couponForm";
import type { Cart } from "@/lib/api/cart";

/** What the shipping row says: the price, "Free" for pickup, or what's still missing */
export function shippingLabel(cart: Cart, delivery: "ship" | "pickup"): string {
	if (!cart.needsShipping) return "Not needed";
	const selected = cart.shippingPackages.flatMap((pkg) => pkg.rates).find((rate) => rate.selected);
	if (!selected || cart.shipping === null) return delivery === "pickup" ? "Free" : "Enter your address";
	return selected.pickup ? "Free (pickup)" : selected.price;
}

/** Checkout order summary: the items, coupon, totals in the order's currency */
export function OrderSummary({ cart, delivery }: { cart: Cart; delivery: "ship" | "pickup" }) {
	const { removeCoupon } = useCart();
	const [removing, setRemoving] = useState<string | null>(null);

	return (
		<div className="space-y-5">
			<ul aria-label="Items in your order" className="divide-y divide-sand">
				{cart.items.map((item) => (
					<li key={item.key} className="flex gap-3 py-3 first:pt-0">
						<div className="relative size-16 shrink-0 bg-white">
							{item.image ? <Image src={item.image} alt="" fill sizes="64px" className="object-cover" /> : null}
							<span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-ink text-[11px] text-white tabular-nums" aria-label={`Quantity ${item.quantity}`}>
								{item.quantity}
							</span>
						</div>
						<div className="min-w-0 flex-1 space-y-0.5 text-sm">
							<p className="text-ink">{item.name}</p>
							{item.options.map((option) => (
								<p key={option} className="text-xs text-charcoal">
									{option}
								</p>
							))}
						</div>
						<p className="shrink-0 text-sm text-black tabular-nums">{item.lineTotal}</p>
					</li>
				))}
			</ul>

			<CouponForm />

			<dl className="space-y-2 border-t border-sand pt-4 text-sm">
				<Row label={`Subtotal (${cart.count} ${cart.count === 1 ? "item" : "items"})`} value={cart.subtotal} />
				{cart.coupons.map((coupon) => (
					<div key={coupon.code} className="flex items-start justify-between gap-3">
						<dt className="flex flex-wrap items-center gap-x-2">
							<span>
								Coupon: <span className="uppercase">{coupon.code}</span>
							</span>
							<button
								type="button"
								disabled={removing === coupon.code}
								onClick={async () => {
									setRemoving(coupon.code);
									await removeCoupon(coupon.code);
									setRemoving(null);
								}}
								className="text-xs text-bronze underline underline-offset-2 hover:text-gold disabled:opacity-60"
							>
								Remove
							</button>
						</dt>
						<dd className="shrink-0 tabular-nums">−{coupon.discount}</dd>
					</div>
				))}
				<Row label={delivery === "pickup" ? "Pickup" : "Shipping"} value={shippingLabel(cart, delivery)} />
				{cart.fees.map((fee) => (
					<Row key={fee.name} label={fee.name} value={fee.amount} />
				))}
				{cart.taxLines.map((tax) => (
					<Row key={tax.label} label={tax.label} value={tax.amount} />
				))}
				<div className="flex items-baseline justify-between gap-3 border-t border-sand pt-3 text-base font-bold text-black">
					<dt>Total</dt>
					<dd className="tabular-nums">
						<span className="mr-1.5 text-xs font-normal text-charcoal">{cart.currency}</span>
						{cart.total}
					</dd>
				</div>
			</dl>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between gap-3">
			<dt>{label}</dt>
			<dd className="text-right tabular-nums">{value}</dd>
		</div>
	);
}
