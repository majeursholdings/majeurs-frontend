import { cacheLife, cacheTag } from "next/cache";
import type { ProductCardProps } from "@/components/common/productCard";
import type { MaterialOption, PriceOption } from "@/lib/shopFilters";
import { sortOptions, type SortValue } from "@/lib/shopSort";
import { formatAmount, formatMoney, type Fx } from "./currency";
import { STORE_API, decodeEntities, wpFetch } from "./wp";

export const PRODUCTS_PER_PAGE = 18;

type StoreProduct = {
	id: number;
	name: string;
	slug: string;
	type: string;
	prices: {
		price: string;
		currency_minor_unit: number;
		price_range: { min_amount: string; max_amount: string } | null;
	};
	images: { src: string; alt: string }[];
	categories: { name: string }[];
};

/** Currency-neutral product summary: safe to cache, converted per visitor by toCard() */
export type ProductSummary = {
	id: number;
	name: string;
	slug: string;
	type: string;
	category?: string;
	images: { src: string; alt?: string }[];
	price: { min: string; max: string; minorUnit: number };
};

export type ProductQuery = {
	page?: number;
	perPage?: number;
	sort?: SortValue;
	/** category slug, e.g. "sofas" or "l-shaped" */
	category?: string;
	/** product tag slug */
	tag?: string;
	search?: string;
	include?: number[];
	/** base currency, minor units (see toBaseMinor) */
	minPrice?: number;
	maxPrice?: number;
	/** pa_material term slugs, any of */
	materials?: string[];
};

export type ProductPage = { products: ProductSummary[]; total: number; totalPages: number };

const MATERIAL_TAXONOMY = "pa_material";

/** Cached an hour, tagged "product-list" so a WP product save can revalidate it. */
export async function getProducts({ page = 1, perPage = PRODUCTS_PER_PAGE, sort = "", category, tag, search, include, minPrice, maxPrice, materials }: ProductQuery = {}): Promise<ProductPage> {
	"use cache";
	cacheLife("hours");
	cacheTag("product-list");

	const { orderby, order } = sortOptions.find((o) => o.value === sort) ?? sortOptions[0];
	const query = new URLSearchParams({ per_page: String(perPage), page: String(page), orderby, order });
	if (category) query.set("category", category);
	if (tag) query.set("tag", tag);
	if (search) query.set("search", search);
	if (include?.length) query.set("include", include.join(","));
	if (minPrice !== undefined) query.set("min_price", String(minPrice));
	if (maxPrice !== undefined) query.set("max_price", String(maxPrice));
	if (materials?.length) {
		query.set("attributes[0][attribute]", MATERIAL_TAXONOMY);
		query.set("attributes[0][operator]", "in");
		materials.forEach((slug) => query.append("attributes[0][slug][]", slug));
	}

	const res = await wpFetch(`${STORE_API}/products?${query}`);
	// WP answers 400 for a page past the end
	if (res.status === 400) return { products: [], total: 0, totalPages: 0 };
	if (!res.ok) throw new Error(`Store API ${res.status} for /products?${query}`);

	const items: StoreProduct[] = await res.json();
	return {
		products: items.map(toSummary),
		total: Number(res.headers.get("x-wp-total") ?? items.length),
		totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
	};
}

export type StoreCategory = { id: number; name: string; slug: string; parent: number; count: number; image: string | null };

export async function getCategories(): Promise<StoreCategory[]> {
	"use cache";
	cacheLife("hours");
	cacheTag("product-categories");

	const res = await wpFetch(`${STORE_API}/products/categories?per_page=100`);
	if (!res.ok) throw new Error(`Store API ${res.status} for /products/categories`);
	const items: (Omit<StoreCategory, "image"> & { image: { src: string } | null })[] = await res.json();
	return items.map((c) => ({ id: c.id, name: decodeEntities(c.name), slug: c.slug, parent: c.parent, count: c.count, image: c.image?.src ?? null }));
}

/** What the archive's filters can offer: price range (base currency, minor units) and materials with product counts */
export type FilterFacets = {
	price: { min: number; max: number; minorUnit: number } | null;
	materials: MaterialOption[];
};

/**
 * Store API collection data for the archive (category, tag or search), so the sidebar only offers materials
 * that have products here. Price and material filters aren't applied, so every option stays visible.
 */
export async function getFilterFacets({ category, tag, search }: Pick<ProductQuery, "category" | "tag" | "search"> = {}): Promise<FilterFacets> {
	"use cache";
	cacheLife("hours");
	cacheTag("product-list");

	const query = new URLSearchParams({
		calculate_price_range: "true",
		"calculate_attribute_counts[0][taxonomy]": MATERIAL_TAXONOMY,
		"calculate_attribute_counts[0][query_type]": "or",
	});
	if (category) query.set("category", category);
	if (tag) query.set("tag", tag);
	if (search) query.set("search", search);

	const [res, terms] = await Promise.all([wpFetch(`${STORE_API}/products/collection-data?${query}`), getMaterialTerms()]);
	if (!res.ok) throw new Error(`Store API ${res.status} for /products/collection-data`);
	const data: {
		price_range: { min_price: string; max_price: string; currency_minor_unit: number } | null;
		attribute_counts: { term: number; count: number }[] | null;
	} = await res.json();

	const counts = new Map((data.attribute_counts ?? []).map((c) => [c.term, c.count]));
	const range = data.price_range;
	return {
		price: range ? { min: Number(range.min_price), max: Number(range.max_price), minorUnit: range.currency_minor_unit } : null,
		materials: terms
			.filter((t) => counts.get(t.id))
			.map((t) => ({ slug: t.slug, name: t.name, count: counts.get(t.id) ?? 0 }))
			.sort((a, b) => a.name.localeCompare(b.name)),
	};
}

async function getMaterialTerms(): Promise<{ id: number; slug: string; name: string }[]> {
	"use cache";
	cacheLife("hours");
	cacheTag("product-attributes");

	const res = await wpFetch(`${STORE_API}/products/attributes`);
	if (!res.ok) throw new Error(`Store API ${res.status} for /products/attributes`);
	const attribute = ((await res.json()) as { id: number; taxonomy: string }[]).find((a) => a.taxonomy === MATERIAL_TAXONOMY);
	if (!attribute) return [];

	const termsRes = await wpFetch(`${STORE_API}/products/attributes/${attribute.id}/terms?per_page=100`);
	if (!termsRes.ok) throw new Error(`Store API ${termsRes.status} for /products/attributes/${attribute.id}/terms`);
	const terms: { id: number; slug: string; name: string }[] = await termsRes.json();
	return terms.map((t) => ({ id: t.id, slug: t.slug, name: decodeEntities(t.name) }));
}

/**
 * Sidebar price buckets in the visitor's currency, on round numbers: $0–$1,000, $1,000–$2,000 … $4,000+.
 * The min/max on each option are what go into ?min_price=&max_price=.
 */
export function toPriceOptions(price: FilterFacets["price"], fx: Fx): PriceOption[] {
	if (!price) return [];
	const min = (price.min / 10 ** price.minorUnit) * fx.rate;
	const max = (price.max / 10 ** price.minorUnit) * fx.rate;
	if (max <= min) return [];

	const raw = (max - min) / 5;
	const magnitude = 10 ** Math.floor(Math.log10(raw));
	const step = ([1, 2, 2.5, 5, 10].find((m) => m * magnitude >= raw) ?? 10) * magnitude;
	const options: PriceOption[] = [];
	for (let from = Math.floor(min / step) * step; from < max; from += step) {
		const to = from + step;
		options.push(to >= max ? { label: `${formatAmount(from, fx, 0)}+`, min: from } : { label: `${formatAmount(from, fx, 0)} – ${formatAmount(to, fx, 0)}`, min: from, max: to });
	}
	return options;
}

function toSummary(p: StoreProduct): ProductSummary {
	const range = p.prices.price_range;
	const category = p.categories.at(-1);
	return {
		id: p.id,
		name: decodeEntities(p.name),
		slug: p.slug,
		type: p.type,
		category: category ? decodeEntities(category.name) : undefined,
		images: p.images.slice(0, 2).map((i) => ({ src: i.src, alt: i.alt || undefined })),
		price: { min: range?.min_amount ?? p.prices.price, max: range?.max_amount ?? p.prices.price, minorUnit: p.prices.currency_minor_unit },
	};
}

/** Summary -> card props, priced in the visitor's currency */
export function toCard(p: ProductSummary, fx: Fx): ProductCardProps {
	const amount = formatMoney(p.price.min, p.price.minorUnit, fx);
	return {
		id: p.id,
		name: p.name,
		href: `/product/${p.slug}/`,
		category: p.category,
		price: p.price.min !== p.price.max ? `From ${amount}` : amount,
		images: p.images,
		// only simple products can go straight into the cart; the rest need options picked first
		purchasable: p.type === "simple",
	};
}

export type StoreTag = { id: number; name: string; slug: string; count: number };

export async function getTags(): Promise<StoreTag[]> {
	"use cache";
	cacheLife("hours");
	cacheTag("product-tags");

	const res = await wpFetch(`${STORE_API}/products/tags?per_page=100`);
	if (!res.ok) throw new Error(`Store API ${res.status} for /products/tags`);
	const items: StoreTag[] = await res.json();
	return items.map((t) => ({ id: t.id, name: decodeEntities(t.name), slug: t.slug, count: t.count }));
}
