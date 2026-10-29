"use client";

import { AnimatePresence, motion } from "motion/react";
import { SearchForm } from "@/components/common/searchForm";

type SearchPanelProps = { open: boolean; onClose: () => void };

/** The header's search button: pressing it toggles the panel itself, so it doesn't count as "outside" */
export const SEARCH_TOGGLE_ATTR = "data-search-toggle";

const isToggle = (target: EventTarget | null) => target instanceof Element && target.closest(`[${SEARCH_TOGGLE_ATTR}]`) !== null;

/**
 * Search drawer under the header (WP: Custom Code 7118). Enter or the arrow goes to /search/?q=.
 * Closes on Escape, on a search, on any press outside it (another link, the page) and when keyboard
 * focus leaves it. Product suggestions appear under the field from 3 characters (SearchForm `suggestions`).
 */
export function SearchPanel({ open, onClose }: SearchPanelProps) {
	// ref callback with a cleanup (React 19; motion passes it through): listens only while the panel is open
	const closeOnOutsidePress = (panel: HTMLElement | null) => {
		if (!panel) return;
		const onPointerDown = (e: PointerEvent) => {
			if (!panel.contains(e.target as Node) && !isToggle(e.target)) onClose();
		};
		document.addEventListener("pointerdown", onPointerDown, true);
		return () => document.removeEventListener("pointerdown", onPointerDown, true);
	};

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					ref={closeOnOutsidePress}
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.18 }}
					className="absolute inset-x-0 top-full border-y border-sand bg-white shadow-[0_12px_24px_rgb(0_0_0/0.08)]"
					onKeyDown={(e) => e.key === "Escape" && onClose()}
					onBlur={(e) => {
						// Tab out of the panel; a press elsewhere is handled above (relatedTarget is null when focus goes nowhere)
						const next = e.relatedTarget;
						if (next && !e.currentTarget.contains(next) && !isToggle(next)) onClose();
					}}
				>
					<SearchForm variant="panel" suggestions="products" placeholder="Search sofas, beds, tables…" autoFocus onSearch={onClose} className="container-site px-2.5 py-5 lg:px-5" />
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
