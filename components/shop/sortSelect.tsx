"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { sortOptions } from "@/lib/shopSort";

/** WP "Default sorting" dropdown. Keeps the choice in ?orderby= and goes back to page 1. */
export function SortSelect() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	return (
		<div className="relative">
			<label htmlFor="shop-sort" className="sr-only">
				Sort products
			</label>
			<select
				id="shop-sort"
				value={searchParams.get("orderby") ?? ""}
				onChange={(e) => {
					const params = new URLSearchParams(searchParams);
					params.delete("paged");
					if (e.target.value) params.set("orderby", e.target.value);
					else params.delete("orderby");
					const base = pathname.replace(/page\/\d+\/$/, "");
					router.push(params.size ? `${base}?${params}` : base);
				}}
				className="h-9 appearance-none border border-sand bg-white pr-9 pl-3 text-xs text-ink outline-none transition-colors duration-500 ease-in-out hover:border-ink focus:border-black"
			>
				{sortOptions.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-ink" aria-hidden />
		</div>
	);
}

export default SortSelect;
