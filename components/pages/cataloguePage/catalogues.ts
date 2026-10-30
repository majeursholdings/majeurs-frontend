import { WP_URL } from "@/lib/api/wp";

const UPLOADS = `${WP_URL}/wp-content/uploads`;

export type Catalogue = { label: string; title: string; image: string; pdf: string };

/** The six catalogue PDFs on WP (same order and covers as the live /catalogue/ page) */
export const catalogues: Catalogue[] = [
	{
		label: "2026 Edition",
		title: "Original, built to last, and made to serve furniture",
		image: `${UPLOADS}/elementor/thumbs/Original-built-to-last-and-made-to-serve-rtuh4pr5ihkei8cuwwf6owe54deb1ec7373o7d0ar4.jpeg`,
		pdf: `${UPLOADS}/A2-1.pdf`,
	},
	{
		label: "A3 Collection",
		title: "Furniture for hotels",
		image: `${UPLOADS}/elementor/thumbs/Reshape_this_image_to_a_20260915120230-rtuh4otbbnj46me82e0k4emoizixtp8gr2g6q31oxc.jpeg`,
		pdf: `${UPLOADS}/A3.pdf`,
	},
	{
		label: "The Trade Program",
		title: "For interior designers, designers, architects, and FF&E specifiers",
		image: `${UPLOADS}/elementor/thumbs/For-interior-designers-designers-architects-and-FFE-specifiers-rtfrug2slxpj5pqugl65x6ewahgo0u7ndbmmesynhs.webp`,
		pdf: `${UPLOADS}/A4.pdf`,
	},
	{
		label: "Turnkey Furnishing",
		title: "For developers, estates, and serviced-apartment operators",
		image: `${UPLOADS}/elementor/thumbs/Turnkey-For-developers-estates-and-serviced-apartment-operators--rtuh4otbbnj46me82e0k4emoizixtp8gr2g6q31oxc.jpeg`,
		pdf: `${UPLOADS}/A5.pdf`,
	},
	{
		label: "Gerrard Holdings",
		title: "A complete turnkey commercial interior",
		image: `${UPLOADS}/elementor/thumbs/A-complete-turnkey-commercial-interior-rtfq4kdaokzytvmpsu8crskgfagra6jsv1hv10pp4g.webp`,
		pdf: `${UPLOADS}/A6.pdf`,
	},
	{
		label: "How Majeurs Work",
		title: "For developers, estates, and serviced-apartment operators",
		image: `${UPLOADS}/elementor/thumbs/For-developers-estates-and-serviced-apartment-operators--rtufvp9e83y2ihqprfyda9bh039if7my8eekubr0q8.jpeg`,
		pdf: `${UPLOADS}/A7.pdf`,
	},
];
