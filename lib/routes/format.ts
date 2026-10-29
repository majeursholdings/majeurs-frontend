/** "uzoe-3-seaters-leather-sofa" -> "Uzoe 3 Seaters Leather Sofa" (placeholder titles until WP data is wired) */
export function titleFromSlug(slug: string): string {
	return decodeURIComponent(slug)
		.split(/[-_]/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

/** WP pagination segments: ["sofas","page","2"] -> { path: ["sofas"], page: 2 } */
export function splitPagination(segments: string[]): { path: string[]; page: number } {
	const i = segments.indexOf("page");
	if (i > -1 && /^\d+$/.test(segments[i + 1] ?? "")) {
		return { path: segments.slice(0, i), page: Number(segments[i + 1]) };
	}
	return { path: segments, page: 1 };
}
