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

/** ?q= on any archive (/shop/, a category or tag): searches within it. undefined when absent or blank. */
export function parseSearch(query: Query): string | undefined {
	return (first(query.q) ?? "").trim().slice(0, 100) || undefined;
}

/**
 * Where the sidebar search goes from an archive page: the same archive (pagination dropped) with ?q=,
 * keeping the sort and filters. An empty term clears the search.
 */
export function archiveSearchHref(pathname: string, current: URLSearchParams, term: string): string {
	const base = pathname.replace(/page\/\d+\/?$/, "");
	const params = new URLSearchParams(current);
	params.delete("paged");
	if (term) params.set("q", term);
	else params.delete("q");
	return params.size ? `${base}?${params}` : base;
}

/** The archive a sidebar sits on, for scoping search suggestions: the category or tag slug from the path */
export function archiveScope(pathname: string): { category?: string; tag?: string } {
	// "/product-category/sofas/l-shaped/page/2/" -> ["product-category", "sofas", "l-shaped"]
	const [kind, ...path] = pathname.replace(/page\/\d+\/?$/, "").split("/").filter(Boolean);
	const slug = path.at(-1);
	if (kind === "product-category" && slug) return { category: slug };
	if (kind === "product-tag" && slug) return { tag: slug };
	return {};
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
