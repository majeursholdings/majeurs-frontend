"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, MoveRight, Plus, X } from "lucide-react";
import { useCart } from "@/components/providers/cartProvider";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { CartItem } from "@/lib/api/cart";
import { cn } from "@/lib/utils";

/**
 * Mini-cart drawer, opened from the header basket and the "added to your cart" toast: the lines (quantity and
 * remove), the subtotal, then checkout or the full cart page.
 */
export function MiniCart() {
	const { cart, drawerOpen, setDrawerOpen } = useCart();
	const close = () => setDrawerOpen(false);
	const count = cart?.count ?? 0;

	return (
		<Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
			<SheetContent side="right" className="w-full gap-0 bg-white text-ink data-[side=right]:sm:max-w-md">
				<div className="flex items-baseline gap-2 border-b border-sand p-5 pr-14">
					<SheetTitle className="text-sm font-bold uppercase tracking-button text-black">Your cart</SheetTitle>
					<SheetDescription className="text-xs text-charcoal">
						{count} {count === 1 ? "item" : "items"}
					</SheetDescription>
				</div>

				{cart?.items.length ? (
					<>
						<ul aria-label="Items in your cart" className="flex-1 divide-y divide-sand overflow-y-auto px-5">
							{cart.items.map((item) => (
								<MiniCartLine key={item.key} item={item} onNavigate={close} />
							))}
						</ul>
						<div className="space-y-3 border-t border-sand bg-sand-50 p-5">
							<div className="flex justify-between gap-3 text-base font-bold text-black">
								<span>Subtotal</span>
								<span className="tabular-nums">{cart.subtotal}</span>
							</div>
							<p className="text-xs text-charcoal">Delivery and VAT are worked out at checkout.</p>
							<Link href="/checkout/" onClick={close} className="btn group w-full border-black bg-black text-white hover:border-gold hover:bg-gold">
								Checkout
								<MoveRight className="size-5 transition-[translate] duration-150 ease-out group-hover:translate-x-1" aria-hidden />
							</Link>
							<Link href="/cart/" onClick={close} className="btn w-full border-ink text-ink hover:bg-ink hover:text-sand">
								View cart
							</Link>
						</div>
					</>
				) : (
					<div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
						<p className="text-h4">Your cart is empty</p>
						<p className="text-sm text-charcoal">Pieces you add will show up here.</p>
						<Link href="/shop/" onClick={close} className="btn mt-3 border-black bg-black text-white hover:border-gold hover:bg-gold">
							Browse the shop
						</Link>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}

function MiniCartLine({ item, onNavigate }: { item: CartItem; onNavigate: () => void }) {
	const { update, remove } = useCart();
	// one change at a time per line, so quick double clicks don't race each other
	const [busy, setBusy] = useState(false);
	const run = async (action: () => Promise<void>) => {
		setBusy(true);
		await action();
		setBusy(false);
	};

	return (
		<li aria-busy={busy} className={cn("flex gap-3 py-4 transition-opacity duration-150", busy && "opacity-60")}>
			<Link href={item.href} onClick={onNavigate} tabIndex={-1} aria-hidden className="relative size-20 shrink-0 overflow-hidden bg-sand-50">
				{item.image ? <Image src={item.image} alt="" fill sizes="80px" className="object-cover" /> : null}
			</Link>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-start justify-between gap-2">
					<Link href={item.href} onClick={onNavigate} className="text-sm text-ink transition-colors duration-150 hover:text-gold">
						{item.name}
					</Link>
					<button
						type="button"
						aria-label={`Remove ${item.name}`}
						disabled={busy}
						onClick={() => run(() => remove(item.key))}
						className="-mt-1.5 -mr-2 flex size-8 shrink-0 items-center justify-center text-ink transition-colors duration-150 hover:bg-black hover:text-white disabled:opacity-40"
					>
						<X className="size-4" />
					</button>
				</div>
				{item.options.map((option) => (
					<p key={option} className="text-xs text-charcoal">
						{option}
					</p>
				))}
				<div className="mt-auto flex items-center justify-between gap-3 pt-1">
					<div role="group" aria-label={`Quantity of ${item.name}`} className="flex items-center border border-sand">
						<button
							type="button"
							aria-label="Decrease quantity"
							disabled={item.quantity <= 1 || busy}
							onClick={() => run(() => update(item.key, item.quantity - 1))}
							className="flex size-8 items-center justify-center transition-colors duration-150 hover:bg-sand-50 disabled:opacity-40"
						>
							<Minus className="size-3.5" />
						</button>
						<span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
							{item.quantity}
						</span>
						<button
							type="button"
							aria-label="Increase quantity"
							disabled={busy}
							onClick={() => run(() => update(item.key, item.quantity + 1))}
							className="flex size-8 items-center justify-center transition-colors duration-150 hover:bg-sand-50 disabled:opacity-40"
						>
							<Plus className="size-3.5" />
						</button>
					</div>
					<p className="text-sm font-bold text-black tabular-nums">{item.lineTotal}</p>
				</div>
			</div>
		</li>
	);
}
