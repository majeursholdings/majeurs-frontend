"use client";

import { Suspense, use, useDeferredValue } from "react";
import Link from "next/link";
import ProductCard, { type ProductCardProps } from "@/components/common/productCard";
import { useWishlist } from "@/components/providers/wishlistProvider";
import { currencyCookie } from "@/lib/currency";

/** One request per list of ids and currency (prices come back converted), reused across renders */
const requests = new Map<string, Promise<ProductCardProps[]>>();

function productsFor(key: string): Promise<ProductCardProps[]> {
	const cacheKey = `${key}|${currencyCookie()}`;
	let request = requests.get(cacheKey);
	if (!request) {
		request = fetch(`/api/products/?include=${key}`)
			.then((res) => (res.ok ? res.json() : []))
			.catch(() => []);
		requests.set(cacheKey, request);
	}
	return request;
}

/** Saved products (ids in the browser) loaded as cards in the visitor's currency. */
export function WishlistGrid() {
	const { ids } = useWishlist();
	// while a removal refetches, keep showing the previous list instead of the skeleton, so the grid doesn't flash
	const key = useDeferredValue(ids.join(","));

	if (!ids.length) {
		return (
			<div className="flex flex-col items-center gap-2 py-16 text-center">
				<p className="text-base text-ink">Your wishlist is empty.</p>
				<p className="text-sm text-charcoal">Tap the heart on any piece to save it here.</p>
				<Link href="/shop/" className="btn mt-5 border-ink text-ink hover:bg-ink hover:text-sand">
					Browse the shop
				</Link>
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4" aria-hidden>
					{ids.map((id) => (
						<div key={id} className="aspect-square animate-pulse bg-sand-50" />
					))}
				</div>
			}
		>
			{/* ids is empty on the server (the list lives in localStorage), so this only renders in the browser */}
			<WishlistCards ids={ids} productsKey={key} />
		</Suspense>
	);
}

function WishlistCards({ ids, productsKey }: { ids: number[]; productsKey: string }) {
	// a removed product disappears at once, before the refetch for the new list lands
	const products = use(productsFor(productsKey)).filter((p) => ids.includes(p.id));
	return (
		<div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
			{products.map((product) => (
				<ProductCard key={product.id} {...product} />
			))}
		</div>
	);
}

export default WishlistGrid;
