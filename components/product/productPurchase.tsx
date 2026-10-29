"use client";

import { useState } from "react";
import Image from "next/image";
import { LoaderCircle, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/providers/cartProvider";
import { BrandIcon } from "@/components/common/brandIcons";
import { trackEvent } from "@/lib/analytics";
import { whatsappLink } from "@/lib/contact";
import { isAvailable, missingOptionsHint } from "@/lib/productOptions";
import { cn } from "@/lib/utils";
import { useProduct } from "./productProvider";

/** SKU of the chosen variation, else the product's */
export function ProductSku() {
	const { product, variation } = useProduct();
	const sku = variation?.sku || product.sku;
	if (!sku) return null;
	return (
		<p className="text-xs">
			<span className="uppercase tracking-button text-gold-muted">SKU:</span> <span className="ml-1 text-grey">{sku}</span>
		</p>
	);
}

/** "FROM $635.00" until a variation is chosen, then that variation's price */
export function ProductPrice() {
	const { product, variation } = useProduct();
	const price = variation?.price ?? product.price;
	const regular = variation ? variation.regularPrice : product.regularPrice;
	return (
		<p className="text-xl uppercase text-black" aria-live="polite">
			{regular ? <del className="mr-2 text-base text-grey">{regular}</del> : null}
			{price}
		</p>
	);
}

/** ShopBuilder swatches: colour circles, material images, or text buttons when the swatch data isn't there */
export function VariationPicker() {
	const { product, selection, select, clear } = useProduct();
	if (!product.options.length) return null;

	return (
		<div className="space-y-5">
			{product.options.map((option) => {
				const chosen = option.terms.find((t) => t.slug === selection[option.name]);
				return (
					<fieldset key={option.name} className="space-y-2.5">
						<legend className="text-sm uppercase text-black">
							{option.name}
							{chosen ? <span className="ml-2 text-xs normal-case text-grey">{chosen.name}</span> : null}
						</legend>
						<div className="flex flex-wrap gap-2.5">
							{option.terms.map((term) => {
								const active = selection[option.name] === term.slug;
								const available = isAvailable(product.options, product.variations, selection, option.name, term.slug);
								const visual = (option.type === "color" && term.color) || (option.type === "image" && term.image);
								return (
									<button
										key={term.slug}
										type="button"
										title={term.name}
										aria-label={term.name}
										aria-pressed={active}
										onClick={() => select(option.name, term.slug)}
										className={cn(
											"relative transition-[box-shadow,opacity] duration-300",
											visual ? "size-11 p-0.5" : "min-h-10 border px-4 text-sm",
											option.type === "color" && visual ? "rounded-full" : "rounded-md",
											visual && (active ? "ring-2 ring-black" : "ring-1 ring-sand hover:ring-black"),
											!visual && (active ? "border-black bg-black text-white" : "border-sand text-ink hover:border-black"),
											!available && "opacity-35",
										)}
									>
										{option.type === "color" && term.color ? <span className="block size-full rounded-full" style={{ backgroundColor: term.color }} /> : null}
										{option.type === "image" && term.image ? (
											<span className="relative block size-full overflow-hidden rounded-[4px]">
												<Image src={term.image} alt="" fill sizes="44px" className="object-cover" />
											</span>
										) : null}
										{visual ? null : term.name}
									</button>
								);
							})}
						</div>
					</fieldset>
				);
			})}
			{Object.keys(selection).length ? (
				<button type="button" onClick={clear} className="text-xs text-ink underline underline-offset-4 hover:text-gold">
					Clear
				</button>
			) : null}
		</div>
	);
}

/** "Have another colour or material in mind? Chat with us on WhatsApp" */
export function CustomOptionLink() {
	const { product } = useProduct();
	return (
		<p className="flex items-center gap-2 text-xs text-grey">
			<BrandIcon name="whatsapp" className="size-4 shrink-0 text-whatsapp" />
			<span>
				Have another colour or material in mind?{" "}
				<a
					href={whatsappLink(`Hello Majeurs, I'd like ${product.name} in a different colour or material.\n${product.url}`)}
					target="_blank"
					rel="noopener noreferrer"
					className="text-black underline underline-offset-2 hover:text-gold"
				>
					Chat with us on WhatsApp
				</a>
			</span>
		</p>
	);
}

/** Quantity stepper + Add to cart, then Buy on WhatsApp */
export function PurchaseActions() {
	const { product, selection, variation } = useProduct();
	const { add, adding } = useCart();
	const [quantity, setQuantity] = useState(1);

	const variable = product.options.length > 0;
	const hint = variable ? missingOptionsHint(product.options, selection) : null;
	const inStock = variation ? variation.inStock : product.inStock;
	const canBuy = product.purchasable && inStock && (!variable || !!variation);
	const cartId = variation?.id ?? product.id;
	const busy = adding === cartId;

	const onAdd = async () => {
		const options = variable ? product.options.map((o) => ({ attribute: o.name, value: selection[o.name] })) : undefined;
		await add(cartId, product.name, quantity, options);
		trackEvent({ event: "add_to_cart", product_id: product.id });
	};

	const chosen = product.options
		.map((o) => {
			const term = o.terms.find((t) => t.slug === selection[o.name]);
			return term ? `${o.name}: ${term.name}` : null;
		})
		.filter(Boolean);
	const message = ["", "", product.name, ...chosen, `Quantity: ${quantity}`, variation?.price ?? product.price, product.url].join("\n");

	return (
		<div className="space-y-3">
			{hint ? <p className="text-xs text-grey">{hint}</p> : null}
			{variable && variation && !variation.inStock ? <p className="text-xs text-destructive">This combination is out of stock.</p> : null}
			{!variable && !product.inStock ? <p className="text-xs text-destructive">Out of stock</p> : null}

			<div className="flex gap-2">
				<div className="flex h-12 shrink-0 items-center border border-black">
					<button
						type="button"
						aria-label="Decrease quantity"
						disabled={quantity <= 1}
						onClick={() => setQuantity((q) => Math.max(1, q - 1))}
						className="flex size-11 items-center justify-center transition-colors hover:bg-sand-50 disabled:opacity-40"
					>
						<Minus className="size-3.5" />
					</button>
					<input
						type="number"
						aria-label="Quantity"
						min={1}
						max={product.maxQuantity}
						value={quantity}
						onChange={(e) => setQuantity(Math.min(product.maxQuantity, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
						className="h-full w-10 appearance-none bg-transparent text-center text-sm outline-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
					<button
						type="button"
						aria-label="Increase quantity"
						disabled={quantity >= product.maxQuantity}
						onClick={() => setQuantity((q) => Math.min(product.maxQuantity, q + 1))}
						className="flex size-11 items-center justify-center transition-colors hover:bg-sand-50 disabled:opacity-40"
					>
						<Plus className="size-3.5" />
					</button>
				</div>
				<button
					type="button"
					disabled={!canBuy || busy}
					aria-busy={busy}
					onClick={onAdd}
					className="btn h-12 flex-1 border-black bg-black text-white hover:border-gold hover:bg-gold disabled:cursor-not-allowed disabled:border-grey disabled:bg-grey"
				>
					{busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
					Add to cart
				</button>
			</div>

			<a
				href={whatsappLink(message)}
				target="_blank"
				rel="noopener noreferrer"
				className="btn h-12 w-full border-whatsapp bg-whatsapp text-white hover:border-[#1ebe5a] hover:bg-[#1ebe5a]"
			>
				<BrandIcon name="whatsapp" className="size-5" />
				Buy on WhatsApp
			</a>
		</div>
	);
}
