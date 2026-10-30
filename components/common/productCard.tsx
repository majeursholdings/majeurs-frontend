import Image from "next/image";
import Link from "next/link";
import { CartBar, WishlistButton } from "./productCardActions";
import { cn } from "@/lib/utils";

export type ProductCardProps = {
	/** WooCommerce product id (cart + wishlist) */
	id: number;
	name: string;
	href: string;
	category?: string;
	/** Preformatted, e.g. "From ₦611,178.93" */
	price: string;
	/** First image is shown at rest, second on hover */
	images: { src: string; alt?: string }[];
	/** Simple products add straight to the cart; variable ones link to the product page to pick options */
	purchasable?: boolean;
	/** First row of a grid: the image is the LCP, so it loads eagerly at high priority instead of lazily */
	eager?: boolean;
	className?: string;
};

/**
 * WP shop card: square image that swaps to the 2nd gallery image on hover, wishlist
 * button (black + tooltip on hover) and an add-to-cart bar that fades up from the image bottom.
 */
export function ProductCard({ id, name, href, category, price, images, purchasable = false, eager = false, className }: ProductCardProps) {
	const [primary, secondary] = images;

	return (
		<article className={cn("group/card border-b-2 border-sand pb-7", className)}>
			<div className="relative aspect-square overflow-hidden bg-sand-50">
				<Link href={href} aria-label={name} className="absolute inset-0">
					{primary ? (
						<Image
							src={primary.src}
							alt={primary.alt ?? name}
							fill
							sizes="(min-width: 1025px) 25vw, (min-width: 768px) 33vw, 50vw"
							loading={eager ? "eager" : undefined}
							fetchPriority={eager ? "high" : undefined}
							// stays opaque underneath so the cross-fade doesn't dip to the background mid-way
							className="object-cover transition-[scale] duration-700 ease-in-out group-hover/card:scale-[1.03]"
						/>
					) : null}
					{secondary ? (
						<Image
							src={secondary.src}
							alt=""
							fill
							sizes="(min-width: 1025px) 25vw, (min-width: 768px) 33vw, 50vw"
							className="object-cover opacity-0 transition-[opacity,scale] duration-700 ease-in-out group-hover/card:scale-[1.03] group-hover/card:opacity-100"
						/>
					) : null}
				</Link>

				<WishlistButton id={id} name={name} />
				<CartBar id={id} name={name} href={href} purchasable={purchasable} />
			</div>

			{category ? <p className="mt-6 text-xs font-bold text-gold-muted">{category}</p> : null}

			<h3 className="mt-2 font-black truncate text-base text-ink">
				<Link href={href} className="transition-colors duration-500 ease-in-out hover:text-gold">
					{name}
				</Link>
			</h3>

			<p className="mt-4 text-sm font-bold text-black">{price}</p>
		</article>
	);
}

export default ProductCard;
