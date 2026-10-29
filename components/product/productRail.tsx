import Link from "next/link";
import { MoveRight } from "lucide-react";
import { ProductCard } from "@/components/common/productCard";
import type { Fx } from "@/lib/api/currency";
import { toCard, type ProductSummary } from "@/lib/api/store";

type ProductRailProps = {
	title: string;
	subtitle?: string;
	/** "Shop all →" button target */
	shopAllHref?: string;
	products: ProductSummary[];
	fx: Fx;
};

/** Four-up product row under the product page: "Complete the Room" and "You Might Also Like" */
export function ProductRail({ title, subtitle, shopAllHref, products, fx }: ProductRailProps) {
	if (!products.length) return null;
	return (
		<section className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-2">
					<h2 className="text-h4">{title}</h2>
					{subtitle ? <p className="text-xs text-grey">{subtitle}</p> : null}
				</div>
				{shopAllHref ? (
					<Link href={shopAllHref} className="btn group border-black text-black hover:bg-black hover:text-white">
						Shop all
						<MoveRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
					</Link>
				) : null}
			</div>
			<div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
				{products.map((p) => (
					<ProductCard key={p.id} {...toCard(p, fx)} />
				))}
			</div>
		</section>
	);
}

/** Matches a rail while it streams in */
export function ProductRailSkeleton() {
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
