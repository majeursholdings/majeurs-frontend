"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { ArrowRight, Search } from "lucide-react";
import MainForm from "@/components/customForm";
import { currencyCookie } from "@/lib/currency";
import { SUGGEST_MIN_CHARS, type Suggestion, type SuggestionSource } from "@/lib/searchSuggestions";
import { cn } from "@/lib/utils";

type SearchFormProps = {
	placeholder: string;
	/** Extra query for /search/, e.g. { type: "post" } for the blog */
	params?: Record<string, string>;
	/** What to suggest as the visitor types (from SUGGEST_MIN_CHARS characters): products, or blog posts */
	suggestions?: SuggestionSource;
	/** Suggest only from this category or tag (product searches on an archive page) */
	scope?: { category?: string; tag?: string };
	/** Where a search goes; defaults to /search/?q=… (+ params). An archive search stays on its archive. */
	searchHref?: (term: string) => string;
	/** The term already searched for, shown in the field; submitting it empty then clears the search */
	defaultValue?: string;
	/** "panel": borderless header search with an arrow button; "field": bordered input with a square icon button */
	variant?: "panel" | "field";
	autoFocus?: boolean;
	/** Runs before navigating, e.g. to close the panel or drawer the form sits in */
	onSearch?: () => void;
	className?: string;
};

type Results = { term: string; items: Suggestion[] };

/** One request per source, scope, term and currency (product prices are converted), reused while typing back and forth */
const requests = new Map<string, Promise<Suggestion[]>>();

function suggestionsFor(source: SuggestionSource, term: string, scope: SearchFormProps["scope"] = {}): Promise<Suggestion[]> {
	const query = new URLSearchParams({ q: term, source });
	if (scope.category) query.set("category", scope.category);
	if (scope.tag) query.set("tag", scope.tag);
	const key = `${query}|${source === "products" ? currencyCookie() : ""}`.toLowerCase();
	let request = requests.get(key);
	if (!request) {
		request = fetch(`/api/search/suggestions/?${query}`)
			.then((res) => (res.ok ? (res.json() as Promise<Suggestion[]>) : []))
			.catch(() => []);
		requests.set(key, request);
	}
	return request;
}

/**
 * Site search bar on MainForm (inline layout): goes to /search/?q=…. With `suggestions`, it's a combobox:
 * from 3 characters a debounced lookup lists matching products or posts; arrows move through them, Enter
 * opens the highlighted one (or searches), Escape closes the list.
 */
export function SearchForm({ placeholder, params, suggestions, scope, searchHref: hrefFor, defaultValue, variant = "field", autoFocus, onSearch, className }: SearchFormProps) {
	const router = useRouter();
	const panel = variant === "panel";
	const listId = useId();

	const [results, setResults] = useState<Results | null>(null);
	const [loading, setLoading] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [active, setActive] = useState(-1);
	// the term the visitor last typed, so a slow reply for an older term is dropped
	const latest = useRef("");

	const lookUp = useDebouncedCallback(async (source: SuggestionSource, term: string) => {
		setLoading(true);
		const items = await suggestionsFor(source, term, scope);
		if (latest.current !== term) return;
		setResults({ term, items });
		setActive(-1);
		setLoading(false);
	}, 250);

	const onInput = (value: string) => {
		if (!suggestions) return;
		const term = value.trim();
		latest.current = term;
		if (term.length < SUGGEST_MIN_CHARS) {
			lookUp.cancel();
			setResults(null);
			setLoading(false);
			setExpanded(false);
			return;
		}
		setExpanded(true);
		lookUp(suggestions, term);
	};

	const items = results?.items ?? [];
	const showList = !!suggestions && expanded && (loading || results !== null);
	const searchHref = (term: string) => (hrefFor ? hrefFor(term) : `/search/?${new URLSearchParams({ q: term, ...params })}`);

	// a link does its own navigation, so clicking one only closes the list (and the panel around the form)
	const close = () => {
		setExpanded(false);
		onSearch?.();
	};
	const go = (href: string) => {
		close();
		router.push(href);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!showList) {
			if (e.key === "ArrowDown" && results) setExpanded(true);
			return;
		}
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			if (!items.length) return;
			setActive((i) => (e.key === "ArrowDown" ? (i + 1) % items.length : i <= 0 ? items.length - 1 : i - 1));
		} else if (e.key === "Enter" && active >= 0 && items[active]) {
			// open the highlighted suggestion instead of submitting the search
			e.preventDefault();
			go(items[active].href);
		} else if (e.key === "Escape") {
			// close the list first; a second Escape reaches the panel around the form
			e.stopPropagation();
			setExpanded(false);
			setActive(-1);
		}
	};

	return (
		<div
			className={cn("relative", className)}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setExpanded(false);
			}}
		>
			<MainForm<{ q: string }>
				layout="inline"
				className={cn("gap-3", !panel && "gap-0")}
				fields={[
					{
						name: "q",
						type: "search",
						placeholder,
						autoFocus,
						autoComplete: "off",
						defaultValue,
						icon: panel ? <Search className="size-5" strokeWidth={1.5} /> : undefined,
						className: panel
							? "h-11 border-0 bg-transparent pl-9 text-base shadow-none focus-visible:ring-0"
							: "h-9 text-xs focus-visible:border-black focus-visible:ring-0",
						inputProps: suggestions
							? {
									role: "combobox",
									"aria-autocomplete": "list",
									"aria-expanded": showList,
									"aria-controls": listId,
									"aria-activedescendant": showList && active >= 0 ? `${listId}-${active}` : undefined,
									onInput: (e) => onInput(e.currentTarget.value),
									onFocus: () => results && setExpanded(true),
									onKeyDown,
								}
							: undefined,
					},
				]}
				onSubmit={({ q }) => {
					const query = q?.trim() ?? "";
					// empty: nothing to do, unless it clears a search already shown
					if (!query && !defaultValue) return;
					go(searchHref(query));
				}}
				renderFooter={() => (
					<button
						type="submit"
						aria-label="Search"
						className={
							panel
								? "btn bg-black px-4 text-white hover:bg-ink"
								: "flex size-9 shrink-0 items-center justify-center bg-black text-white transition-colors duration-150 hover:bg-gold"
						}
					>
						{panel ? <ArrowRight className="size-4" aria-hidden /> : <Search className="size-3.5" aria-hidden />}
					</button>
				)}
			/>

			{suggestions ? (
				<>
					<p className="sr-only" aria-live="polite">
						{showList && results && !loading ? (items.length ? `${items.length} suggestions. Use the arrow keys to choose one.` : "No suggestions.") : ""}
					</p>
					{showList ? (
						<div
							className={cn(
								"bg-white",
								// header panel: grows the panel; sidebars: floats over the page
								panel ? "mt-4 border-t border-sand pt-4" : "absolute inset-x-0 top-full z-30 mt-1 border border-sand shadow-[0_12px_24px_rgb(0_0_0/0.08)]",
							)}
						>
							<ul id={listId} role="listbox" aria-label="Suggestions" className={cn(panel ? "grid gap-x-6 gap-y-1 md:grid-cols-2 lg:grid-cols-3" : "py-1")}>
								{items.map((item, i) => (
									<li key={item.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
										<Link
											href={item.href}
											tabIndex={-1}
											onClick={close}
											onMouseEnter={() => setActive(i)}
											className={cn("flex items-center gap-3 px-3 py-2 transition-colors duration-150", i === active && "bg-sand-50")}
										>
											<span className={cn("relative shrink-0 overflow-hidden bg-sand-50", panel ? "size-14" : "size-10")}>
												{item.image ? <Image src={item.image} alt="" fill sizes="56px" className="object-cover" /> : null}
											</span>
											<span className="min-w-0">
												{item.eyebrow ? <span className="block truncate text-xs text-gold-muted">{item.eyebrow}</span> : null}
												<span className={cn("block truncate text-black", panel ? "text-sm" : "text-xs")} title={item.title}>
													{item.title}
												</span>
												{item.meta ? <span className="block text-xs text-charcoal tabular-nums">{item.meta}</span> : null}
											</span>
										</Link>
									</li>
								))}
							</ul>

							{loading && !items.length ? <p className="px-3 py-3 text-sm text-charcoal">Searching…</p> : null}
							{!loading && results && !items.length ? (
								<p className="px-3 py-3 text-sm text-charcoal">
									No {suggestions === "posts" ? "articles" : "products"} match “{results.term}”.
								</p>
							) : null}
							{results ? (
								<Link
									href={searchHref(results.term)}
									tabIndex={-1}
									onClick={close}
									className="group flex items-center gap-2 border-t border-sand px-3 py-3 text-sm text-bronze transition-colors duration-150 hover:text-gold"
								>
									See all results for “{results.term}”
									<ArrowRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
								</Link>
							) : null}
						</div>
					) : null}
				</>
			) : null}
		</div>
	);
}

export default SearchForm;
