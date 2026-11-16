import localFont from "next/font/local";

/**
 * Brand fonts, copied from majeurs.com (wp-content/uploads), subset to Latin (+ Latin Extended Additional,
 * general punctuation, currency symbols) and unhinted: 129 KB -> 38 KB for the three files. All three preload on
 * every page ahead of the hero image, so their weight is LCP time on mobile. Re-subset with
 * `python3 -m fontTools.subset <font> --flavor=woff2 --unicodes=<ranges> --layout-features='*' --no-hinting`.
 * See docs/design-system.md for licensing notes before launch.
 */
export const helveticaNeue = localFont({
	src: [
		{ path: "../public/font/helvetica-neue-light.woff2", weight: "300", style: "normal" },
		{ path: "../public/font/helvetica-neue-regular.woff2", weight: "400", style: "normal" },
	],
	variable: "--font-helvetica-neue",
	display: "swap",
	fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const nordique = localFont({
	src: [
		// Regular only: it's the one weight licensed (see DESIGN_SYSTEM.md)
		{ path: "../public/font/nordique-pro-regular.woff2", weight: "400", style: "normal" },
	],
	variable: "--font-nordique",
	display: "swap",
	fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});
