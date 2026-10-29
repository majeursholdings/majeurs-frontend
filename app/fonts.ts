import localFont from "next/font/local";

/**
 * Brand fonts, copied from majeurs.com (wp-content/uploads).
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
		{ path: "../public/font/nordique-pro-regular.woff", weight: "400", style: "normal" },
		// The semibold is a Fontspring DEMO file that draws 28 symbols and "4" as a "DEMO" stamp. This copy drops
		// those glyphs so they fall back to Helvetica. Replace with the licensed file (see DESIGN_SYSTEM.md).
		{ path: "../public/font/nordique-pro-semibold-nodemo.woff2", weight: "600", style: "normal" },
	],
	variable: "--font-nordique",
	display: "swap",
	fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});
