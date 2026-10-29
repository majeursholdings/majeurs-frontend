// Shared by the server fetch (components/shop/productArchive.tsx) and the client filter sidebar, so keep it free of server imports

/**
 * Archive filters, kept in the URL with WooCommerce's own names so old links still work:
 *   ?min_price=500&max_price=1000   in the visitor's currency (major units)
 *   ?filter_material=uf-2039-38,uf-2039-30
 */
export type ShopFilters = { minPrice?: number; maxPrice?: number; materials: string[] };

/** A price bucket in the sidebar, in the visitor's currency; no max means "and above" */
export type PriceOption = { label: string; min: number; max?: number };
export type MaterialOption = { slug: string; name: string; count: number };
export type FilterOptions = { prices: PriceOption[]; materials: MaterialOption[] };

type Query = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function amount(value: string | string[] | undefined): number | undefined {
	const raw = first(value);
	if (!raw) return undefined;
	const n = Number(raw);
	return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseFilters(query: Query): ShopFilters {
	const materials = (first(query.filter_material) ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter((s) => /^[a-z0-9-]+$/.test(s))
		.slice(0, 20);
	return { minPrice: amount(query.min_price), maxPrice: amount(query.max_price), materials };
}

/** Writes the filters into `params`, replacing any already there */
export function setFilterParams(params: URLSearchParams, { minPrice, maxPrice, materials }: ShopFilters) {
	params.delete("min_price");
	params.delete("max_price");
	params.delete("filter_material");
	if (minPrice !== undefined) params.set("min_price", String(minPrice));
	if (maxPrice !== undefined) params.set("max_price", String(maxPrice));
	if (materials.length) params.set("filter_material", materials.join(","));
	return params;
}
