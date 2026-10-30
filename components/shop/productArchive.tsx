import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/common/productCard";
import { CatalogShell } from "@/components/shop/catalogShell";
import { Pagination } from "@/components/shop/pagination";
import { SortSelect } from "@/components/shop/sortSelect";
import { getFilterFacets, getProducts, toCard, toPriceOptions, PRODUCTS_PER_PAGE } from "@/lib/api/store";
import { getFx, toBaseMinor } from "@/lib/api/currency";
import { setFilterParams, type ShopFilters } from "@/lib/shopFilters";
import type { SortValue } from "@/lib/shopSort";

type ProductArchiveProps = {
	page: number;
	sort: SortValue;
	/** Archive root for pagination links, e.g. "/shop/" */
	basePath: string;
	category?: string;
	tag?: string;
	search?: string;
	/** price (visitor's currency) and material filters from the URL */
	filters?: ShopFilters;
	/** see Pagination.queryParam */
	pageParam?: string;
};

/** Shop archive body: sidebar + result count + sorting + 3-up product grid + pagination. */
export async function ProductArchive({ page, sort, basePath, category, tag, search, filters = { materials: [] }, pageParam }: ProductArchiveProps) {
	const [fx, facets] = await Promise.all([getFx(), getFilterFacets({ category, tag, search })]);
	// the URL's prices are in the visitor's currency; the Store API filters on base-currency minor units
	const minorUnit = facets.price?.minorUnit ?? 2;
	const { products, total, totalPages } = await getProducts({
		page,
		sort,
		category,
		tag,
		search,
		minPrice: filters.minPrice === undefined ? undefined : toBaseMinor(filters.minPrice, minorUnit, fx, Math.floor),
		maxPrice: filters.maxPrice === undefined ? undefined : toBaseMinor(filters.maxPrice, minorUnit, fx, Math.ceil),
		materials: filters.materials,
	});
	if (page > 1 && !products.length) notFound();
	const filtered = filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.materials.length > 0;

	const first = (page - 1) * PRODUCTS_PER_PAGE + 1;
	const last = first + products.length - 1;
	const count = total
		? `Showing ${first}–${last} of ${total} results`
		: search
			? `No products match “${search}”${filtered ? " with these filters" : ""}`
			: filtered
				? "No products match these filters"
				: "No products found";
	// /search/ is all about the term, so only the archives (shop, categories, tags) offer to clear it
	const clearQuery = archiveQuery(sort, filters);
	const clearHref = clearQuery ? `${basePath}?${clearQuery}` : basePath;

	return (
		<CatalogShell
			resultCount={
				search && basePath !== "/search/" ? (
					<>
						{total ? `${count} for “${search}”` : count}
						<span aria-hidden> · </span>
						<Link href={clearHref} className="text-bronze underline underline-offset-2 hover:text-gold">
							Clear search
						</Link>
					</>
				) : (
					count
				)
			}
			toolbar={<SortSelect />}
			filters={{ prices: toPriceOptions(facets.price, fx), materials: facets.materials }}
		>
			<div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
				{products.map((product, i) => (
					// the grid is 3-up on desktop, 2-up on mobile: the first row holds the LCP image
					<ProductCard key={product.id} {...toCard(product, fx)} eager={i < 3} />
				))}
			</div>
			<Pagination page={page} totalPages={totalPages} basePath={basePath} query={archiveQuery(sort, filters, search)} queryParam={pageParam} />
		</CatalogShell>
	);
}

function archiveQuery(sort: SortValue, filters: ShopFilters, search?: string) {
	const query = new URLSearchParams();
	if (search) query.set("q", search);
	if (sort) query.set("orderby", sort);
	setFilterParams(query, filters);
	return query.size ? query.toString() : undefined;
}

/** Matches the archive layout while the products stream in */
export function ProductArchiveSkeleton() {
	return (
		<CatalogShell>
			<div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
				{Array.from({ length: 6 }, (_, i) => (
					<div key={i} className="space-y-4 border-b-2 border-sand pb-7">
						<div className="aspect-square animate-pulse bg-sand-50" />
						<div className="h-3 w-1/4 animate-pulse bg-sand-50" />
						<div className="h-4 w-3/4 animate-pulse bg-sand-50" />
						<div className="h-3 w-1/3 animate-pulse bg-sand-50" />
					</div>
				))}
			</div>
		</CatalogShell>
	);
}

export default ProductArchive;
