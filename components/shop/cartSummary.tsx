"use client";

import { useState } from "react";
import Link from "next/link";
import { Hammer, Headset, MoveRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { useCart } from "@/components/providers/cartProvider";
import type { Cart } from "@/lib/api/cart";
import { CUSTOMER_SERVICE_EMAIL, CUSTOMER_SERVICE_PHONE, PRODUCTION_TIME, cartOrderMessage, whatsappLink } from "@/lib/contact";
import { CouponForm } from "./couponForm";

/** Order summary: totals, coupons, checkout and WhatsApp, then what the order comes with. `ref` lets the mobile bar know when it's on screen. */
export function CartSummary({ cart, ref }: { cart: Cart; ref?: React.Ref<HTMLElement> }) {
	const { removeCoupon } = useCart();
	const [removing, setRemoving] = useState<string | null>(null);

	return (
		<aside ref={ref} aria-labelledby="order-summary-title" className="h-fit space-y-6 lg:sticky lg:top-28">
			<div className="space-y-4 bg-sand-50 p-6">
				<h2 id="order-summary-title" className="text-sm font-bold uppercase tracking-button">
					Order summary
				</h2>
				<dl className="space-y-2 text-sm">
					<div className="flex justify-between gap-3">
						<dt>
							Subtotal ({cart.count} {cart.count === 1 ? "item" : "items"})
						</dt>
						<dd>{cart.subtotal}</dd>
					</div>
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
							<dd className="shrink-0">−{coupon.discount}</dd>
						</div>
					))}
					<div className="flex justify-between gap-3">
						<dt>Shipping</dt>
						<dd className="text-right">{cart.shipping ?? "Calculated at checkout"}</dd>
					</div>
					<div className="flex justify-between gap-3 border-t border-sand pt-3 text-base font-bold text-black">
						<dt>Total</dt>
						<dd>{cart.total}</dd>
					</div>
				</dl>
				<CouponForm />
				<Link href="/checkout/" className="btn group w-full border-black bg-black text-white hover:border-gold hover:bg-gold">
					Proceed to checkout
					<MoveRight className="size-5 transition-[translate] duration-150 ease-out group-hover:translate-x-1" aria-hidden />
				</Link>
				<a
					href={whatsappLink(cartOrderMessage(cart))}
					target="_blank"
					rel="noopener noreferrer"
					className="btn w-full border-whatsapp bg-whatsapp text-white hover:border-[#1ebe5a] hover:bg-[#1ebe5a]"
				>
					<BrandIcon name="whatsapp" className="size-5" />
					Order via WhatsApp
				</a>
			</div>

			<CartAssurance />
		</aside>
	);
}

/** What every order comes with, from the live shipping, warranty and returns policies */
function CartAssurance() {
	const points = [
		{
			icon: Hammer,
			title: "Made to order",
			text: `Every piece is made for you in our Lagos workshop. Production takes ${PRODUCTION_TIME} per product.`,
			link: { href: "/faqs/", label: "FAQs" },
		},
		{
			icon: Truck,
			title: "Door-to-door delivery",
			text: "To Nigeria, other African countries, the UK, Europe and the USA. International orders travel in protective crates.",
			link: { href: "/shipping-policy/", label: "Shipping policy" },
		},
		{
			icon: ShieldCheck,
			title: "12-month warranty",
			text: "Covers manufacturing faults, materials and workmanship from the day of delivery.",
			link: { href: "/warranty-policy/", label: "Warranty policy" },
		},
		{
			icon: RotateCcw,
			title: "30-day returns",
			text: "On unused pieces in their original condition. Made-to-order pieces can be exchanged or credited.",
			link: { href: "/refund_returns/", label: "Returns policy" },
		},
	];

	return (
		<ul className="space-y-5 px-1 text-sm">
			{points.map(({ icon: Icon, title, text, link }) => (
				<li key={title} className="flex gap-3">
					<Icon className="mt-0.5 size-5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
					<div className="space-y-1">
						<p className="text-black">{title}</p>
						<p className="text-charcoal">
							{text}{" "}
							<Link href={link.href} className="text-bronze underline underline-offset-2 hover:text-gold">
								{link.label}
							</Link>
						</p>
					</div>
				</li>
			))}
			<li className="flex gap-3">
				<Headset className="mt-0.5 size-5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
				<div className="space-y-1">
					<p className="text-black">Need help with your order?</p>
					<p className="text-charcoal">
						Call{" "}
						<a href={CUSTOMER_SERVICE_PHONE.href} className="whitespace-nowrap text-bronze underline underline-offset-2 hover:text-gold">
							{CUSTOMER_SERVICE_PHONE.label}
						</a>{" "}
						or email{" "}
						<a href={`mailto:${CUSTOMER_SERVICE_EMAIL}`} className="break-all text-bronze underline underline-offset-2 hover:text-gold">
							{CUSTOMER_SERVICE_EMAIL}
						</a>
						.
					</p>
				</div>
			</li>
		</ul>
	);
}
