"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import MainForm from "@/components/customForm";
import { cn } from "@/lib/utils";

type SearchFormProps = {
	placeholder: string;
	/** Extra query for /search/, e.g. { type: "post" } for the blog */
	params?: Record<string, string>;
	/** "panel": borderless header search with an arrow button; "field": bordered input with a square icon button */
	variant?: "panel" | "field";
	autoFocus?: boolean;
	/** Runs before navigating, e.g. to close the panel or drawer the form sits in */
	onSearch?: () => void;
	className?: string;
};

/** Site search bar on MainForm (inline layout): goes to /search/?q=… */
export function SearchForm({ placeholder, params, variant = "field", autoFocus, onSearch, className }: SearchFormProps) {
	const router = useRouter();
	const panel = variant === "panel";

	return (
		<MainForm<{ q: string }>
			layout="inline"
			className={cn("gap-3", !panel && "gap-0", className)}
			fields={[
				{
					name: "q",
					type: "search",
					placeholder,
					autoFocus,
					icon: panel ? <Search className="size-5" strokeWidth={1.5} /> : undefined,
					className: panel
						? "h-11 border-0 bg-transparent pl-9 text-base shadow-none focus-visible:ring-0"
						: "h-9 text-xs focus-visible:border-black focus-visible:ring-0",
				},
			]}
			onSubmit={({ q }) => {
				const query = q?.trim();
				if (!query) return;
				onSearch?.();
				router.push(`/search/?${new URLSearchParams({ q: query, ...params })}`);
			}}
			renderFooter={() => (
				<button
					type="submit"
					aria-label="Search"
					className={
						panel
							? "btn bg-black px-4 text-white hover:bg-ink"
							: "flex size-9 shrink-0 items-center justify-center bg-black text-white transition-colors duration-500 ease-in-out hover:bg-gold"
					}
				>
					{panel ? <ArrowRight className="size-4" aria-hidden /> : <Search className="size-3.5" aria-hidden />}
				</button>
			)}
		/>
	);
}

export default SearchForm;
