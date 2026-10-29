"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ProductImage, ProductOption, ProductVariation } from "@/lib/api/product";
import { choose, defaultSelection, findVariation, type Selection } from "@/lib/productOptions";

/** A variation priced in the visitor's currency */
export type PricedVariation = Omit<ProductVariation, "price" | "regularPrice"> & { price: string; regularPrice?: string };

/** What the product page's client components need, with prices already formatted on the server */
export type ProductClientData = {
	id: number;
	name: string;
	/** absolute URL, for sharing and the WhatsApp message */
	url: string;
	sku: string;
	inStock: boolean;
	purchasable: boolean;
	maxQuantity: number;
	images: ProductImage[];
	/** "From $635.00" for a range, else "$954.00" */
	price: string;
	/** crossed-out price when on sale */
	regularPrice?: string;
	options: ProductOption[];
	variations: PricedVariation[];
};

type ProductContextValue = {
	product: ProductClientData;
	selection: Selection;
	/** the variation matching the chosen options; undefined until every option is chosen */
	variation: PricedVariation | undefined;
	select: (name: string, slug: string) => void;
	clear: () => void;
};

const ProductContext = createContext<ProductContextValue | null>(null);

/** Shares the chosen options between the gallery, price, SKU and add-to-cart on the product page. */
export function ProductProvider({ product, children }: { product: ProductClientData; children: React.ReactNode }) {
	const [selection, setSelection] = useState<Selection>(() => defaultSelection(product.options));

	const value = useMemo<ProductContextValue>(
		() => ({
			product,
			selection,
			variation: findVariation(product.options, product.variations, selection),
			select: (name, slug) => setSelection((current) => choose(product.options, product.variations, current, name, slug)),
			clear: () => setSelection({}),
		}),
		[product, selection],
	);

	return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
	const ctx = useContext(ProductContext);
	if (!ctx) throw new Error("useProduct must be used inside <ProductProvider>");
	return ctx;
}
