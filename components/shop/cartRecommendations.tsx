"use client";

import { Suspense, use, useDeferredValue } from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import ProductCard, { type ProductCardProps } from "@/components/common/productCard";
import { currencyCookie } from "@/lib/currency";

type Rails = { completeTheRoom: ProductCardProps[]; youMightAlsoLike: ProductCardProps[] };

const NONE: Rails = { completeTheRoom: [], youMightAlsoLike: [] };

/** One request per set of cart products and currency, reused across renders */
const requests = new Map<string, Promise<Rails>>();

function railsFor(slugs: string): Promise<Rails> {
	const cacheKey = `${slugs}|${currencyCookie()}`;
	let request = requests.get(cacheKey);
	if (!request) {
		request = fetch(`/api/products/recommendations/?for=${encodeURIComponent(slugs)}`)
			.then((res) => (res.ok ? (res.json() as Promise<Rails>) : NONE))
			.catch(() => NONE);
		requests.set(cacheKey, request);
	}
	return request;
}

/**
 * "Complete the Room" and "You Might Also Like" under the cart: the cross-sells and upsells of what's in it
 * (lib/api/product.ts getCartRecommendations). Adding a piece from here changes the cart, and the rails
 * refetch in the background while the current ones stay up.
 */
export function CartRecommendations({ slugs }: { slugs: string[] }) {
	// sorted and de-duplicated, so a quantity change or a re-order doesn't refetch
	const key = useDeferredValue([...new Set(slugs)].sort().join(","));
	return (
		<Suspense fallback={<RailSkeleton />}>
			<CartRails slugsKey={key} />
		</Suspense>
	);
}

function CartRails({ slugsKey }: { slugsKey: string }) {
	const { completeTheRoom, youMightAlsoLike } = use(railsFor(slugsKey));
	return (
		<>
			<Rail id="complete-the-room" title="Complete the Room" subtitle="Pieces made to sit alongside what’s in your cart" products={completeTheRoom} />
			<Rail id="you-might-also-like" title="You Might Also Like" subtitle="More from the collection" products={youMightAlsoLike} shopAllHref="/shop/" />
		</>
	);
}

function Rail({ id, title, subtitle, products, shopAllHref }: { id: string; title: string; subtitle: string; products: ProductCardProps[]; shopAllHref?: string }) {
	if (!products.length) return null;
	return (
		<section aria-labelledby={`${id}-title`} className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-2">
					<h2 id={`${id}-title`} className="text-h4">
						{title}
					</h2>
					<p className="text-xs text-grey">{subtitle}</p>
				</div>
				{shopAllHref ? (
					<Link href={shopAllHref} className="btn group border-black text-black hover:bg-black hover:text-white">
						Shop all
						<MoveRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-1" aria-hidden />
					</Link>
				) : null}
			</div>
			<div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
				{products.map((product) => (
					<ProductCard key={product.id} {...product} />
				))}
			</div>
		</section>
	);
}

function RailSkeleton() {
	return (
		<div className="space-y-8" aria-hidden>
			<div className="h-7 w-56 animate-pulse bg-sand-50" />
			<div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
				{Array.from({ length: 4 }, (_, i) => (
					<div key={i} className="space-y-4">
						<div className="aspect-square animate-pulse bg-sand-50" />
						<div className="h-4 w-3/4 animate-pulse bg-sand-50" />
					</div>
				))}
			</div>
		</div>
	);
}
