import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationProps = {
	page: number;
	totalPages: number;
	/** Archive root, e.g. "/shop/". Page n lives at `${basePath}page/n/` (WP permalinks). */
	basePath: string;
	/** Query to keep across pages, e.g. "orderby=price" */
	query?: string;
	/** Put the page in the query (?paged=2) instead of the path, for routes without /page/n/ (search) */
	queryParam?: string;
};

/** WP archive pagination: numbered squares, current page in gold. */
export function Pagination({ page, totalPages, basePath, query, queryParam }: PaginationProps) {
	if (totalPages <= 1) return null;

	const href = (n: number) => {
		const params = new URLSearchParams(query);
		if (queryParam && n > 1) params.set(queryParam, String(n));
		const path = queryParam || n === 1 ? basePath : `${basePath}page/${n}/`;
		return params.size ? `${path}?${params}` : path;
	};

	return (
		<nav aria-label="Pagination" className="mt-12 flex flex-wrap justify-center gap-2">
			{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
				<Link
					key={n}
					href={href(n)}
					aria-current={n === page ? "page" : undefined}
					className={cn(
						"flex size-8 items-center justify-center border text-xs transition-colors duration-500 ease-in-out",
						n === page ? "border-gold bg-gold text-white" : "border-sand text-ink hover:border-gold hover:text-gold",
					)}
				>
					{n}
				</Link>
			))}
		</nav>
	);
}

export default Pagination;
