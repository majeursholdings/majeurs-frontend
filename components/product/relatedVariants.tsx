import Image from "next/image";
import Link from "next/link";
import type { Fx } from "@/lib/api/currency";
import { getRelatedVariants, type ProductDetail } from "@/lib/api/product";
import { toCard } from "@/lib/api/store";

/** The other versions of this design (upsells, else the same category), as small tiles under the buy buttons */
export async function RelatedVariants({ product, fx }: { product: ProductDetail; fx: Fx }) {
	const variants = await getRelatedVariants(product);
	if (!variants.length) return null;
	return (
		<section aria-labelledby="related-variants" className="space-y-3">
			<h2 id="related-variants" className="text-xs font-bold tracking-eyebrow text-gold-muted uppercase">
				Related variants
			</h2>
			<ul className="grid grid-cols-4 gap-3">
				{variants.map((p) => {
					const card = toCard(p, fx);
					const [image] = card.images;
					return (
						<li key={card.id}>
							<Link href={card.href} className="group block space-y-2">
								<div className="relative aspect-square overflow-hidden bg-sand-50">
									{image ? (
										<Image src={image.src} alt="" fill sizes="(min-width: 768px) 10vw, 25vw" className="object-cover transition-[scale] duration-500 group-hover:scale-[1.04]" />
									) : null}
								</div>
								<p className="line-clamp-2 text-xs text-ink transition-colors group-hover:text-gold">{card.name}</p>
								<p className="text-xs font-bold text-black">{card.price}</p>
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

export function RelatedVariantsSkeleton() {
	return (
		<div className="grid grid-cols-4 gap-3" aria-hidden>
			{Array.from({ length: 4 }, (_, i) => (
				<div key={i} className="aspect-square animate-pulse bg-sand-50" />
			))}
		</div>
	);
}
