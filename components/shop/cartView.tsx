"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, MoveRight, Plus, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { useCart } from "@/components/providers/cartProvider";
import { cartOrderMessage, whatsappLink } from "@/lib/contact";
import { CouponForm } from "./couponForm";

/** Cart page body: line items with quantity steppers, then the order summary with coupons and checkout / WhatsApp. */
export function CartView() {
	const { cart, update, remove, removeCoupon } = useCart();
	// one change per line at a time, so quick double clicks don't race each other
	const [busy, setBusy] = useState<string | null>(null);
	const run = async (key: string, action: () => Promise<void>) => {
		setBusy(key);
		await action();
		setBusy(null);
	};

	if (!cart) {
		return <div className="h-60 animate-pulse bg-sand-50" aria-label="Loading your cart" />;
	}

	if (!cart.items.length) {
		return (
			<div className="flex flex-col items-center gap-2 py-16 text-center">
				<p className="text-base text-ink">Your cart is empty.</p>
				<Link href="/shop/" className="btn mt-5 border-ink text-ink hover:bg-ink hover:text-sand">
					Continue shopping
				</Link>
			</div>
		);
	}

	return (
		<div className="grid gap-10 lg:grid-cols-[1fr_360px]">
			<ul className="divide-y divide-sand border-y border-sand">
				{cart.items.map((item) => (
					<li key={item.key} className="flex gap-4 py-5">
						<Link href={item.href} className="relative size-24 shrink-0 overflow-hidden bg-sand-50 md:size-28">
							{item.image ? <Image src={item.image} alt="" fill sizes="112px" className="object-cover" /> : null}
						</Link>

						<div className="flex min-w-0 flex-1 flex-col gap-1">
							<div className="flex items-start justify-between gap-3">
								<Link href={item.href} className="text-base text-ink transition-colors duration-500 ease-in-out hover:text-gold">
									{item.name}
								</Link>
								<button
									type="button"
									aria-label={`Remove ${item.name}`}
									disabled={busy === item.key}
									onClick={() => run(item.key, () => remove(item.key))}
									className="flex size-8 shrink-0 items-center justify-center text-ink transition-colors duration-500 ease-in-out hover:bg-black hover:text-white"
								>
									<X className="size-4" />
								</button>
							</div>
							{item.options.map((option) => (
								<p key={option} className="text-xs text-charcoal">
									{option}
								</p>
							))}
							<p className="text-sm text-charcoal">{item.price}</p>

							<div className="mt-auto flex items-center justify-between gap-3 pt-2">
								<div className="flex items-center border border-sand">
									<button
										type="button"
										aria-label="Decrease quantity"
										disabled={item.quantity <= 1 || busy === item.key}
										onClick={() => run(item.key, () => update(item.key, item.quantity - 1))}
										className="flex size-8 items-center justify-center transition-colors duration-500 ease-in-out hover:bg-sand-50 disabled:opacity-40"
									>
										<Minus className="size-3.5" />
									</button>
									<span className="w-8 text-center text-sm" aria-live="polite">
										{item.quantity}
									</span>
									<button
										type="button"
										aria-label="Increase quantity"
										disabled={busy === item.key}
										onClick={() => run(item.key, () => update(item.key, item.quantity + 1))}
										className="flex size-8 items-center justify-center transition-colors duration-500 ease-in-out hover:bg-sand-50 disabled:opacity-40"
									>
										<Plus className="size-3.5" />
									</button>
								</div>
								<p className="text-sm font-bold text-black">{item.lineTotal}</p>
							</div>
						</div>
					</li>
				))}
			</ul>

			<aside className="h-fit space-y-4 bg-sand-50 p-6">
				<h2 className="text-sm font-bold uppercase tracking-button">Order summary</h2>
				<dl className="space-y-2 text-sm">
					<div className="flex justify-between">
						<dt>Subtotal</dt>
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
									disabled={busy === coupon.code}
									onClick={() => run(coupon.code, () => removeCoupon(coupon.code))}
									className="text-xs text-bronze underline underline-offset-2 hover:text-gold disabled:opacity-60"
								>
									Remove
								</button>
							</dt>
							<dd className="shrink-0">−{coupon.discount}</dd>
						</div>
					))}
					<div className="flex justify-between">
						<dt>Shipping</dt>
						<dd>{cart.shipping ?? "Calculated at checkout"}</dd>
					</div>
					<div className="flex justify-between border-t border-sand pt-3 text-base font-bold text-black">
						<dt>Total</dt>
						<dd>{cart.total}</dd>
					</div>
				</dl>
				<CouponForm />
				<Link href="/checkout/" className="btn group w-full border-black bg-black text-white hover:border-gold hover:bg-gold">
					Proceed to checkout
					<MoveRight className="size-5 transition-transform duration-500 ease-in-out group-hover:translate-x-1" />
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
			</aside>
		</div>
	);
}

export default CartView;
