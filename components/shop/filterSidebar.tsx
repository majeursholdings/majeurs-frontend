"use client";

import Link from "next/link";
import { Suspense, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, Plus } from "lucide-react";
import { shopCategories } from "@/lib/navigation";
import { archiveScope, archiveSearchHref, parseFilters, setFilterParams, type FilterOptions, type ShopFilters } from "@/lib/shopFilters";
import { SearchForm } from "@/components/common/searchForm";
import { cn } from "@/lib/utils";

type Section = "categories" | "prices" | "materials";

/**
 * "Filter by" sidebar from the WP shop archive: product search, category, price and material accordions, reset.
 * Price and material choices live in the URL (lib/shopFilters.ts), so results are shareable and server-rendered.
 * `filters` is left out while the archive loads; the sidebar then shows categories only.
 */
export function FilterSidebar({ filters }: { filters?: FilterOptions }) {
	const pathname = usePathname();
	const [openSection, setOpenSection] = useState<Section | null>(null);

	const toggle = (s: Section) => setOpenSection((v) => (v === s ? null : s));

	return (
		<aside aria-label="Product filters" className="space-y-6">
			<p className="text-xs font-normal uppercase tracking-button text-black">Filter by:</p>

			{/* reads the URL, so it sits in its own Suspense (cacheComponents); the fallback is the same field */}
			<Suspense fallback={<SearchForm placeholder="Search Products..." suggestions="products" />}>
				<ArchiveSearch />
			</Suspense>

			<div className="border-t border-sand">
				<FilterSection title="Filter by Categories" open={openSection === "categories"} onToggle={() => toggle("categories")}>
					<ul className="space-y-2 pb-4">
						{shopCategories.map((cat) => (
							<li key={cat.href}>
								<Link
									href={cat.href}
									className={cn("text-sm text-charcoal hover:text-gold", pathname?.startsWith(cat.href) && "text-gold")}
								>
									{cat.label}
								</Link>
							</li>
						))}
					</ul>
				</FilterSection>
				{filters ? <ArchiveFilters filters={filters} openSection={openSection} onToggle={toggle} /> : null}
			</div>

			{filters ? null : (
				<Link href="/shop/" className="btn w-full bg-black text-white hover:bg-ink">
					Reset filter
				</Link>
			)}
		</aside>
	);
}

/**
 * Product search for the archive it sits on: on a category or tag page it searches (and suggests) within
 * that archive and stays there with ?q=, keeping the sort and filters; on /shop/ and /search/ it covers everything.
 */
function ArchiveSearch() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const q = searchParams.get("q") ?? "";
	const scope = archiveScope(pathname);
	return (
		<SearchForm
			// remount when the search changes, so the field shows the term just searched for
			key={q}
			placeholder={scope.category || scope.tag ? "Search in this category..." : "Search Products..."}
			suggestions="products"
			scope={scope}
			defaultValue={q}
			searchHref={(term) => archiveSearchHref(pathname, searchParams, term)}
		/>
	);
}

/** Price and material sections plus reset; reads and writes the URL query */
function ArchiveFilters({ filters, openSection, onToggle }: { filters: FilterOptions; openSection: Section | null; onToggle: (s: Section) => void }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [pending, startTransition] = useTransition();
	const active = parseFilters(Object.fromEntries(searchParams));
	// filtering starts again from page 1
	const base = pathname.replace(/page\/\d+\/$/, "");

	const apply = (next: ShopFilters) => {
		const params = setFilterParams(new URLSearchParams(searchParams), next);
		params.delete("paged");
		startTransition(() => router.push(params.size ? `${base}?${params}` : base, { scroll: false }));
	};

	const toggleMaterial = (slug: string) =>
		apply({ ...active, materials: active.materials.includes(slug) ? active.materials.filter((m) => m !== slug) : [...active.materials, slug] });

	// reset keeps the search term on /search/ but drops filters and sorting
	const q = searchParams.get("q");
	const resetHref = q ? `${base}?${new URLSearchParams({ q })}` : base;

	return (
		<div aria-busy={pending} className={cn("transition-opacity duration-300", pending && "opacity-60")}>
			{filters.prices.length ? (
				<FilterSection title="Filter by Prices" open={openSection === "prices"} onToggle={() => onToggle("prices")}>
					<ul className="space-y-2 pb-4">
						{filters.prices.map((option) => {
							const selected = active.minPrice === option.min && active.maxPrice === option.max;
							return (
								<li key={option.label}>
									<button
										type="button"
										aria-pressed={selected}
										onClick={() => apply({ ...active, minPrice: selected ? undefined : option.min, maxPrice: selected ? undefined : option.max })}
										className={cn("text-left text-sm text-charcoal hover:text-gold", selected && "text-gold")}
									>
										{option.label}
									</button>
								</li>
							);
						})}
					</ul>
				</FilterSection>
			) : null}

			{filters.materials.length ? (
				<FilterSection
					title={active.materials.length ? `Filter by Materials (${active.materials.length})` : "Filter by Materials"}
					open={openSection === "materials"}
					onToggle={() => onToggle("materials")}
				>
					<ul className="max-h-72 space-y-2 overflow-y-auto pb-4 pr-1">
						{filters.materials.map((material) => {
							const checked = active.materials.includes(material.slug);
							return (
								<li key={material.slug}>
									<label className="group flex cursor-pointer items-start gap-2.5 text-sm text-charcoal hover:text-gold">
										<input type="checkbox" checked={checked} onChange={() => toggleMaterial(material.slug)} className="peer sr-only" />
										<span
											aria-hidden
											className={cn(
												"mt-0.5 flex size-4 shrink-0 items-center justify-center border border-sand transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-gold group-hover:border-gold",
												checked && "border-gold bg-gold text-white",
											)}
										>
											{checked ? <Check className="size-3" /> : null}
										</span>
										<span className={cn(checked && "text-gold")}>
											{material.name} <span className="text-grey">({material.count})</span>
										</span>
									</label>
								</li>
							);
						})}
					</ul>
				</FilterSection>
			) : null}

			<Link href={resetHref} className="btn mt-6 w-full bg-black text-white hover:bg-ink">
				Reset filter
			</Link>
		</div>
	);
}

function FilterSection({
	title,
	open,
	onToggle,
	children,
}: {
	title: string;
	open: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="border-b border-sand">
			<button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center justify-between py-4 text-xs text-black">
				{title}
				{open ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
			</button>
			<AnimatePresence initial={false}>
				{open ? (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						{children}
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
