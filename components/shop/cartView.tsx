"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, MoveRight, Plus, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { useCart } from "@/components/providers/cartProvider";
import { useWishlist } from "@/components/providers/wishlistProvider";
import type { Cart, CartItem } from "@/lib/api/cart";
import { whatsappLink } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { CartRecommendations } from "./cartRecommendations";
import { CartUnavailable } from "./cartUnavailable";
import { CartSummary } from "./cartSummary";
import { ProductCare } from "./productCare";

/** /product/<slug>/ -> slug, for the recommendations */
const slugOf = (href: string) => href.split("/").filter(Boolean).at(-1) ?? "";

/**
 * Cart page body: line items, product care, the order summary (sticky on desktop), then "Complete the Room"
 * and "You Might Also Like" from the cart's own cross-sells and upsells. On mobile a checkout bar takes
 * over while the summary is off screen.
 */
export function CartView() {
	const { cart, loadFailed, reload } = useCart();
	const [summaryInView, setSummaryInView] = useState(true);

	// ref callback with a cleanup (React 19): watches the summary while it's mounted
	const watchSummary = useCallback((summary: HTMLElement | null) => {
		if (!summary) return;
		const observer = new IntersectionObserver(([entry]) => setSummaryInView(entry.isIntersecting));
		observer.observe(summary);
		return () => observer.disconnect();
	}, []);

	if (!cart && loadFailed) return <CartUnavailable onRetry={reload} />;
	if (!cart) return <CartSkeleton />;
	if (!cart.items.length) return <EmptyCart />;

	return (
		<div className="space-y-20 pb-24 lg:space-y-28 lg:pb-0">
			<div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
				<div className="space-y-10">
					<ul aria-label="Items in your cart" className="divide-y divide-sand border-y border-sand">
						{cart.items.map((item) => (
							<CartLine key={item.key} item={item} />
						))}
					</ul>
					<ProductCare />
				</div>
				<CartSummary cart={cart} ref={watchSummary} />
			</div>

			<div className="space-y-20 lg:space-y-28">
				<CartRecommendations slugs={cart.items.map((item) => slugOf(item.href))} />
			</div>

			<MobileCheckoutBar cart={cart} hidden={summaryInView} />
		</div>
	);
}

function CartLine({ item }: { item: CartItem }) {
	const { update, remove } = useCart();
	// one change at a time per line, so quick double clicks don't race each other
	const [busy, setBusy] = useState(false);
	const run = async (action: () => Promise<void>) => {
		setBusy(true);
		await action();
		setBusy(false);
	};

	return (
		<li aria-busy={busy} className={cn("flex gap-4 py-5 transition-opacity duration-150", busy && "opacity-60")}>
			<Link href={item.href} tabIndex={-1} aria-hidden className="relative size-24 shrink-0 overflow-hidden bg-sand-50 md:size-28">
				{item.image ? <Image src={item.image} alt="" fill sizes="112px" className="object-cover" /> : null}
			</Link>

			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-start justify-between gap-3">
					<Link href={item.href} className="text-base text-ink transition-colors duration-150 hover:text-gold">
						{item.name}
					</Link>
					<button
						type="button"
						aria-label={`Remove ${item.name}`}
						disabled={busy}
						onClick={() => run(() => remove(item.key))}
						className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center text-ink transition-colors duration-150 hover:bg-black hover:text-white disabled:opacity-40"
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
					<div role="group" aria-label={`Quantity of ${item.name}`} className="flex items-center border border-sand">
						<button
							type="button"
							aria-label="Decrease quantity"
							disabled={item.quantity <= 1 || busy}
							onClick={() => run(() => update(item.key, item.quantity - 1))}
							className="flex size-9 items-center justify-center transition-colors duration-150 hover:bg-sand-50 disabled:opacity-40"
						>
							<Minus className="size-3.5" />
						</button>
						<span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
							{item.quantity}
						</span>
						<button
							type="button"
							aria-label="Increase quantity"
							disabled={busy}
							onClick={() => run(() => update(item.key, item.quantity + 1))}
							className="flex size-9 items-center justify-center transition-colors duration-150 hover:bg-sand-50 disabled:opacity-40"
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

/** ≤1024px: total and checkout pinned to the bottom while the summary is off screen */
function MobileCheckoutBar({ cart, hidden }: { cart: Cart; hidden: boolean }) {
	return (
		<div
			inert={hidden}
			className={cn(
				"fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-sand bg-white px-4 py-3 transition-[translate] duration-200 ease-out lg:hidden",
				hidden && "translate-y-full",
			)}
		>
			<div className="text-sm">
				<p className="text-charcoal">Total</p>
				<p className="font-bold text-black tabular-nums">{cart.total}</p>
			</div>
			<Link href="/checkout/" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
				Checkout
				<MoveRight className="size-4" aria-hidden />
			</Link>
		</div>
	);
}

function EmptyCart() {
	const { count: saved } = useWishlist();
	return (
		<div className="flex flex-col items-center gap-3 py-16 text-center">
			<p className="text-h4">Your cart is empty</p>
			<p className="max-w-md text-sm text-charcoal">Explore the collection, or tell us what you have in mind and we’ll help you find the right piece.</p>
			<div className="mt-5 flex flex-wrap justify-center gap-3">
				<Link href="/shop/" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
					Browse the shop
				</Link>
				<a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn border-ink text-ink hover:bg-ink hover:text-sand">
					<BrandIcon name="whatsapp" className="size-5" />
					Chat with us
				</a>
			</div>
			{saved ? (
				<Link href="/wishlist/" className="mt-4 inline-flex items-center gap-2 text-sm text-bronze underline-offset-4 hover:underline">
					<Heart className="size-4" strokeWidth={1.5} aria-hidden />
					You have {saved} saved {saved === 1 ? "piece" : "pieces"} in your wishlist
				</Link>
			) : null}
		</div>
	);
}

/** Same shape as the loaded cart, so nothing jumps when it arrives */
function CartSkeleton() {
	return (
		<div className="grid gap-10 lg:grid-cols-[1fr_360px]" aria-busy="true" aria-label="Loading your cart">
			<div className="divide-y divide-sand border-y border-sand">
				{Array.from({ length: 2 }, (_, i) => (
					<div key={i} className="flex gap-4 py-5">
						<div className="size-24 shrink-0 animate-pulse bg-sand-50 md:size-28" />
						<div className="flex-1 space-y-3 pt-1">
							<div className="h-4 w-1/2 animate-pulse bg-sand-50" />
							<div className="h-3 w-1/4 animate-pulse bg-sand-50" />
						</div>
					</div>
				))}
			</div>
			<div className="h-80 animate-pulse bg-sand-50" />
		</div>
	);
}

export default CartView;
