"use client";

import dynamic from "next/dynamic";

/**
 * SearchForm fetched on first render instead of shipped with the page. Its form kit (MainForm: react-hook-form,
 * zod, the select and calendar components) is ~130 KB gzipped, and anything the root not-found.tsx or the header
 * imports statically is bundled into every page of the site, so those two places use this instead.
 */
export const LazySearchForm = dynamic(() => import("./searchForm").then((mod) => mod.SearchForm), {
	ssr: false,
	loading: () => <div aria-busy className="h-12" />,
});
