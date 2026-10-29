import type { FilterOptions } from "@/lib/shopFilters";
import { FilterSidebar } from "./filterSidebar";
import { MobileFilter } from "./mobileFilter";

type CatalogShellProps = {
	/** e.g. "Showing 1–18 of 73 results", plus a "Clear search" link while searching */
	resultCount?: React.ReactNode;
	/** Sorting control (Phase 1) */
	toolbar?: React.ReactNode;
	/** price buckets and materials for this archive; left out while loading */
	filters?: FilterOptions;
	children: React.ReactNode;
};

/**
 * Body of the WP shop/category/tag archive: filter sidebar on the left (desktop) and a bordered
 * results panel with the result count and sorting on top, then the product grid.
 */
export function CatalogShell({ resultCount, toolbar, filters, children }: CatalogShellProps) {
	return (
		<div className="container-site grid gap-10 px-2.5 py-12.5 lg:grid-cols-[230px_1fr] lg:gap-5 lg:py-20">
			<div className="hidden lg:block">
				<FilterSidebar filters={filters} />
			</div>
			<div className="min-w-0 lg:border lg:border-sand lg:p-5">
				<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
					{resultCount ? <p className="w-full text-xs text-charcoal md:w-auto">{resultCount}</p> : null}
					<MobileFilter filters={filters} />
					{toolbar}
				</div>
				{children}
			</div>
		</div>
	);
}

export default CatalogShell;
