"use client";

import Link from "next/link";
import { Heart, LoaderCircle, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cartProvider";
import { useWishlist } from "@/components/providers/wishlistProvider";
import { cn } from "@/lib/utils";

/** Centre heart: toggles the browser wishlist, black + tooltip on hover, stays filled when saved. */
export function WishlistButton({ id, name }: { id: number; name: string }) {
	const { has, toggle } = useWishlist();
	const saved = has(id);
	const label = saved ? "Remove from wishlist" : "Add to wishlist";

	return (
		<button
			type="button"
			aria-label={label}
			aria-pressed={saved}
			onClick={() => toast.success(toggle(id) ? `${name} saved to your wishlist` : `${name} removed from your wishlist`)}
			className={cn(
				"group/wish absolute top-1/2 left-1/2 flex size-11 -translate-1/2 items-center justify-center transition-[opacity,background-color,color] duration-500 ease-in-out group-hover/card:opacity-100 focus-visible:opacity-100 hover:bg-black hover:text-white",
				saved ? "bg-black text-white opacity-100" : "bg-white text-ink opacity-0",
			)}
		>
			<Heart className={cn("size-5", saved && "fill-current")} />
			<span
				role="tooltip"
				className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap bg-black px-2.5 py-1 text-xs text-white translate-y-1 opacity-0 transition-[opacity,translate] duration-400 ease-in-out group-hover/wish:translate-y-0 group-hover/wish:opacity-100 group-focus-visible/wish:translate-y-0 group-focus-visible/wish:opacity-100"
			>
				{label}
			</span>
		</button>
	);
}

const bar =
	"absolute inset-x-0 bottom-0 py-2.5 px-3 flex h-fit translate-y-full items-center justify-center gap-3 bg-black text-sm text-white opacity-0 transition-[translate,opacity,background-color] duration-600 ease-in-out group-hover/card:translate-y-0 group-hover/card:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 hover:bg-gold";

/** Bottom bar: simple products go straight into the cart, the rest open the product page to pick options. */
export function CartBar({ id, name, href, purchasable }: { id: number; name: string; href: string; purchasable: boolean }) {
	const { add, adding } = useCart();

	if (!purchasable) {
		return (
			<Link href={href} className={bar}>
				<ShoppingBasket className="size-5" />
				Select Options
			</Link>
		);
	}

	const busy = adding === id;
	return (
		<button type="button" disabled={busy} aria-busy={busy} onClick={() => add(id, name)} className={cn(bar, busy && "translate-y-0 opacity-100")}>
			{busy ? <LoaderCircle className="size-5 animate-spin" /> : <ShoppingBasket className="size-5" />}
			Add to Cart
		</button>
	);
}
