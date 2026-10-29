"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard, { type ProductCardProps } from "@/components/common/productCard";
import { useWishlist } from "@/components/providers/wishlistProvider";

/** Saved products (ids in the browser) loaded as cards in the visitor's currency. */
export function WishlistGrid() {
	const { ids } = useWishlist();
	const key = ids.join(",");
	const [loaded, setLoaded] = useState<{ key: string; products: ProductCardProps[] } | null>(null);

	useEffect(() => {
		if (!key) return;
		let active = true;
		fetch(`/api/products/?include=${key}`)
			.then((res) => (res.ok ? res.json() : []))
			.then((products: ProductCardProps[]) => active && setLoaded({ key, products }))
			.catch(() => active && setLoaded({ key, products: [] }));
		return () => {
			active = false;
		};
	}, [key]);

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

	// keep showing the previous list while a removal refetches, so the grid doesn't flash
	const products = (loaded?.products ?? []).filter((p) => ids.includes(p.id));

	if (!loaded) {
		return (
			<div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4" aria-hidden>
				{ids.map((id) => (
					<div key={id} className="aspect-square animate-pulse bg-sand-50" />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
			{products.map((product) => (
				<ProductCard key={product.id} {...product} />
			))}
		</div>
	);
}

export default WishlistGrid;
