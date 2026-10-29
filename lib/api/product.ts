import { cacheLife, cacheTag } from "next/cache";
import { getCategories, getProducts, type ProductSummary } from "./store";
import { STORE_API, decodeEntities } from "./wp";

type StoreImage = { id: number; src: string; thumbnail: string; alt: string; name: string };
type StoreTerm = { id: number; name: string; slug: string; default?: boolean };
type StorePrices = { price: string; regular_price: string; currency_code: string; currency_minor_unit: number; price_range: { min_amount: string; max_amount: string } | null };

type StoreProductDetail = {
	id: number;
	name: string;
	slug: string;
	type: string;
	sku: string;
	short_description: string;
	description: string;
	on_sale: boolean;
	prices: StorePrices;
	images: StoreImage[];
	categories: { id: number; name: string; slug: string; link: string }[];
	attributes: { name: string; taxonomy: string | null; has_variations: boolean; terms: StoreTerm[] }[];
	variations: { id: number; attributes: { name: string; value: string }[] }[];
	is_in_stock: boolean;
	is_purchasable: boolean;
	dimensions: { length: string; width: string; height: string };
	weight: string;
	add_to_cart: { minimum: number; maximum: number };
	/** from docs/wordpress/majeurs-product-extras.php, when installed */
	extensions: {
		majeurs?: {
			cross_sell_ids: number[];
			upsell_ids: number[];
			swatches: Record<string, { type: "color" | "image" | "button"; terms: Record<string, { color?: string; image?: string }> }>;
		};
	};
};

type StoreVariation = { id: number; sku: string; prices: StorePrices; images: StoreImage[]; is_in_stock: boolean; is_purchasable: boolean };

export type ProductImage = { src: string; thumb: string; alt: string };

export type ProductOption = {
	/** Store API attribute label, e.g. "Material"; also the key in ProductVariation.attributes */
	name: string;
	type: "color" | "image" | "button";
	terms: { name: string; slug: string; color?: string; image?: string }[];
	/** term slug WooCommerce pre-selects */
	defaultSlug?: string;
};

export type ProductVariation = {
	id: number;
	/** option name -> term slug; "" means any */
	attributes: Record<string, string>;
	sku: string;
	/** base-currency minor units, converted per visitor */
	price: string;
	regularPrice: string;
	inStock: boolean;
	image?: ProductImage;
};

/** Currency-neutral product page data: safe to cache, priced per visitor on the page */
export type ProductDetail = {
	id: number;
	name: string;
	slug: string;
	type: string;
	sku: string;
	shortDescription: string;
	/** WP editor HTML (trusted: written by Majeurs staff in wp-admin) */
	description: string;
	images: ProductImage[];
	breadcrumbs: { name: string; href: string }[];
	/** deepest category, for the "Complete the Room" / "You Might Also Like" fallbacks */
	category?: { name: string; slug: string };
	/** base currency (Store API), minor units */
	price: { min: string; max: string; regular: string; minorUnit: number; currency: string; onSale: boolean };
	inStock: boolean;
	purchasable: boolean;
	maxQuantity: number;
	options: ProductOption[];
	variations: ProductVariation[];
	specs: { label: string; value: string }[];
	crossSellIds: number[];
	upsellIds: number[];
};

/** Cached an hour, tagged "product:<slug>" so a WP product save can revalidate it. null when there's no such product. */
export async function getProduct(slug: string): Promise<ProductDetail | null> {
	"use cache";
	cacheLife("hours");
	cacheTag(`product:${slug}`, "product-list");

	const res = await fetch(`${STORE_API}/products?slug=${encodeURIComponent(slug)}`);
	if (!res.ok) throw new Error(`Store API ${res.status} for /products?slug=${slug}`);
	const [product]: StoreProductDetail[] = await res.json();
	if (!product) return null;

	const [variations, categories] = await Promise.all([getVariations(product), getCategories()]);
	return toDetail(product, variations, categories);
}

/** All of a variable product's variations (price, sku, image) in one Store API call */
async function getVariations(product: StoreProductDetail): Promise<Map<number, StoreVariation>> {
	if (!product.variations.length) return new Map();
	const ids = product.variations.map((v) => v.id);
	const query = new URLSearchParams({ type: "variation", include: ids.join(","), per_page: "100" });
	const res = await fetch(`${STORE_API}/products?${query}`);
	if (!res.ok) throw new Error(`Store API ${res.status} for variations of ${product.slug}`);
	const items: StoreVariation[] = await res.json();
	return new Map(items.map((v) => [v.id, v]));
}

function toImage(image: StoreImage, fallbackAlt: string): ProductImage {
	return { src: image.src, thumb: image.thumbnail || image.src, alt: decodeEntities(image.alt || fallbackAlt) };
}

function toDetail(p: StoreProductDetail, variations: Map<number, StoreVariation>, categories: Awaited<ReturnType<typeof getCategories>>): ProductDetail {
	const name = decodeEntities(p.name);
	const extras = p.extensions.majeurs;
	const range = p.prices.price_range;

	// the category with the longest URL is the most specific one, e.g. /product-category/sofas/3-seaters/
	const deepest = [...p.categories].sort((a, b) => b.link.length - a.link.length)[0];
	const breadcrumbs = deepest
		? new URL(deepest.link).pathname
				.replace(/^\/product-category\/|\/$/g, "")
				.split("/")
				.map((slug, i, all) => ({
					name: categories.find((c) => c.slug === slug)?.name ?? decodeEntities(slug),
					href: `/product-category/${all.slice(0, i + 1).join("/")}/`,
				}))
		: [];

	const options: ProductOption[] = p.attributes
		.filter((a) => a.has_variations)
		.map((a) => {
			const swatch = extras?.swatches?.[a.name];
			return {
				name: a.name,
				type: swatch?.type ?? "button",
				terms: a.terms.map((t) => ({ name: decodeEntities(t.name), slug: t.slug, ...swatch?.terms[t.slug] })),
				defaultSlug: a.terms.find((t) => t.default)?.slug,
			};
		});

	const { length, width, height } = p.dimensions;
	const specs = [
		// WooCommerce > Settings > Products: dimensions in cm, weight in kg
		length && width && height ? { label: "Dimensions", value: `${length} × ${width} × ${height} cm` } : null,
		p.weight ? { label: "Weight", value: `${p.weight} kg` } : null,
		...p.attributes.map((a) => ({ label: a.name, value: a.terms.map((t) => decodeEntities(t.name)).join(", ") })),
	].filter((s): s is { label: string; value: string } => !!s?.value);

	return {
		id: p.id,
		name,
		slug: p.slug,
		type: p.type,
		sku: p.sku.toUpperCase(),
		shortDescription: p.short_description,
		description: p.description,
		images: p.images.map((i) => toImage(i, name)),
		breadcrumbs,
		category: deepest ? { name: decodeEntities(deepest.name), slug: deepest.slug } : undefined,
		price: {
			min: range?.min_amount ?? p.prices.price,
			max: range?.max_amount ?? p.prices.price,
			regular: p.prices.regular_price,
			minorUnit: p.prices.currency_minor_unit,
			currency: p.prices.currency_code,
			onSale: p.on_sale,
		},
		inStock: p.is_in_stock,
		purchasable: p.is_purchasable,
		maxQuantity: Math.min(p.add_to_cart.maximum || 99, 99),
		options,
		variations: p.variations.map((v) => {
			const data = variations.get(v.id);
			return {
				id: v.id,
				attributes: Object.fromEntries(v.attributes.map((a) => [a.name, a.value])),
				sku: (data?.sku ?? p.sku).toUpperCase(),
				price: data?.prices.price ?? p.prices.price,
				regularPrice: data?.prices.regular_price ?? p.prices.regular_price,
				inStock: data?.is_in_stock ?? p.is_in_stock,
				image: data?.images[0] ? toImage(data.images[0], name) : undefined,
			};
		}),
		specs,
		crossSellIds: extras?.cross_sell_ids ?? [],
		upsellIds: extras?.upsell_ids ?? [],
	};
}

/**
 * "Complete the Room": the product's cross-sells, or popular pieces from other categories until
 * the product-extras snippet is installed.
 */
export async function getCompleteTheRoom(product: ProductDetail, limit = 4): Promise<ProductSummary[]> {
	if (product.crossSellIds.length) {
		return (await getProducts({ include: product.crossSellIds, perPage: limit })).products;
	}
	const { products } = await getProducts({ sort: "popularity", perPage: 24 });
	return products.filter((p) => p.id !== product.id && p.category !== product.category?.name).slice(0, limit);
}

export type CartRecommendations = { completeTheRoom: ProductSummary[]; youMightAlsoLike: ProductSummary[] };

/**
 * The cart page's two rails, from the products in the cart (by slug): their combined cross-sells
 * ("Complete the Room") and upsells ("You Might Also Like"), leaving out what's already in the cart.
 * Without any, falls back like the product page does, from the first product in the cart.
 */
export async function getCartRecommendations(slugs: string[], limit = 4): Promise<CartRecommendations> {
	const products = (await Promise.all(slugs.map((slug) => getProduct(slug).catch(() => null)))).filter((p): p is ProductDetail => p !== null);
	const [first] = products;
	if (!first) return { completeTheRoom: [], youMightAlsoLike: [] };

	const inCart = new Set(products.map((p) => p.id));
	const notInCart = (ids: number[]) => [...new Set(ids)].filter((id) => !inCart.has(id));
	const crossIds = notInCart(products.flatMap((p) => p.crossSellIds)).slice(0, limit);
	const upIds = notInCart(products.flatMap((p) => p.upsellIds))
		.filter((id) => !crossIds.includes(id))
		.slice(0, limit);

	const completeTheRoom = crossIds.length
		? (await getProducts({ include: crossIds, perPage: limit })).products
		: (await getCompleteTheRoom({ ...first, crossSellIds: [] }, limit + inCart.size)).filter((p) => !inCart.has(p.id)).slice(0, limit);
	// don't show the same piece in both rails
	const shown = [...inCart, ...completeTheRoom.map((p) => p.id)];
	const youMightAlsoLike = upIds.length
		? (await getProducts({ include: upIds, perPage: limit })).products
		: await getYouMightAlsoLike({ ...first, upsellIds: [] }, shown, limit);

	return { completeTheRoom, youMightAlsoLike };
}

/** "You Might Also Like": the product's upsells, or other pieces from its category */
export async function getYouMightAlsoLike(product: ProductDetail, exclude: number[] = [], limit = 4): Promise<ProductSummary[]> {
	if (product.upsellIds.length) {
		return (await getProducts({ include: product.upsellIds, perPage: limit })).products;
	}
	const skip = new Set([product.id, ...exclude]);
	const { products } = await getProducts({ category: product.category?.slug, perPage: limit + skip.size });
	return products.filter((p) => !skip.has(p.id)).slice(0, limit);
}
