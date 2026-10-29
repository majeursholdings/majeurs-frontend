"use client";

import { AnimatePresence, motion } from "motion/react";
import { SearchForm } from "@/components/common/searchForm";

type SearchPanelProps = { open: boolean; onClose: () => void };

/**
 * Search drawer under the header (WP: Custom Code 7118). Enter or the arrow goes to /search/?q=.
 * TODO (Phase 1): live product results from /wp-json/wc/store/v1/products?search= with
 * use-debounce + axios, showing the top-level price_html.
 */
export function SearchPanel({ open, onClose }: SearchPanelProps) {
	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.18 }}
					className="absolute inset-x-0 top-full border-y border-sand bg-white shadow-[0_12px_24px_rgb(0_0_0/0.08)]"
					onKeyDown={(e) => e.key === "Escape" && onClose()}
				>
					<SearchForm variant="panel" placeholder="Search sofas, beds, tables…" autoFocus onSearch={onClose} className="container-site py-5" />
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
