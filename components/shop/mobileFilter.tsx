"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import type { FilterOptions } from "@/lib/shopFilters";
import { FilterSidebar } from "./filterSidebar";

const ease = [0.4, 0, 0.2, 1] as const;

/** ≤1024px: "Filter" button that slides the filter sidebar in from the left. */
export function MobileFilter({ filters }: { filters?: FilterOptions }) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		const overflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = overflow;
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div className="lg:hidden">
			<button
				type="button"
				aria-expanded={open}
				aria-controls="mobile-filter"
				onClick={() => setOpen(true)}
				className="btn border-ink text-ink hover:bg-ink hover:text-sand"
			>
				<SlidersHorizontal className="size-4" aria-hidden />
				Filter
			</button>

			<AnimatePresence>
				{open ? (
					<>
						<motion.div
							aria-hidden
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5, ease }}
							onClick={() => setOpen(false)}
							className="fixed inset-0 z-50 bg-black/50"
						/>
						<motion.div
							id="mobile-filter"
							role="dialog"
							aria-modal="true"
							aria-label="Product filters"
							initial={{ x: "-100%" }}
							animate={{ x: 0 }}
							exit={{ x: "-100%" }}
							transition={{ duration: 0.5, ease }}
							// close once a filter link is followed or a search is submitted
							onClickCapture={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
							onSubmitCapture={() => setOpen(false)}
							className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-80 overflow-y-auto bg-white px-5 pt-4 pb-10"
						>
							<div className="mb-4 flex justify-end">
								<button
									type="button"
									autoFocus
									aria-label="Close filters"
									onClick={() => setOpen(false)}
									className="flex size-9 items-center justify-center text-ink transition-colors duration-500 ease-in-out hover:bg-black hover:text-white"
								>
									<X className="size-5" />
								</button>
							</div>
							<FilterSidebar filters={filters} />
						</motion.div>
					</>
				) : null}
			</AnimatePresence>
		</div>
	);
}

export default MobileFilter;
