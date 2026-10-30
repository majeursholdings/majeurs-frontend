import { definePage, image, list, text, textarea, upload } from "../model.ts";

export const catalogue = definePage({
	id: "catalogue",
	wpId: 84,
	path: "/catalogue/",
	title: "Catalogue page content",
	fields: {
		heroTitle: text("Hero: title", "Discover Our Latest Catalogues"),
		heroText: textarea("Hero: text", "Click below to download"),

		catalogues: list(
			"Catalogues",
			{
				label: text("Label"),
				title: text("Title"),
				image: image("Cover"),
				pdf: text("PDF link", "", "The PDF's URL in the media library (Media > the file > Copy URL)."),
			},
			[
				{
					label: "2026 Edition",
					title: "Original, built to last, and made to serve furniture",
					image: upload("elementor/thumbs/Original-built-to-last-and-made-to-serve-rtuh4pr5ihkei8cuwwf6owe54deb1ec7373o7d0ar4.jpeg"),
					pdf: upload("A2-1.pdf"),
				},
				{
					label: "A3 Collection",
					title: "Furniture for hotels",
					image: upload("elementor/thumbs/Reshape_this_image_to_a_20260915120230-rtuh4otbbnj46me82e0k4emoizixtp8gr2g6q31oxc.jpeg"),
					pdf: upload("A3.pdf"),
				},
				{
					label: "The Trade Program",
					title: "For interior designers, designers, architects, and FF&E specifiers",
					image: upload("elementor/thumbs/For-interior-designers-designers-architects-and-FFE-specifiers-rtfrug2slxpj5pqugl65x6ewahgo0u7ndbmmesynhs.webp"),
					pdf: upload("A4.pdf"),
				},
				{
					label: "Turnkey Furnishing",
					title: "For developers, estates, and serviced-apartment operators",
					image: upload("elementor/thumbs/Turnkey-For-developers-estates-and-serviced-apartment-operators--rtuh4otbbnj46me82e0k4emoizixtp8gr2g6q31oxc.jpeg"),
					pdf: upload("A5.pdf"),
				},
				{
					label: "Gerrard Holdings",
					title: "A complete turnkey commercial interior",
					image: upload("elementor/thumbs/A-complete-turnkey-commercial-interior-rtfq4kdaokzytvmpsu8crskgfagra6jsv1hv10pp4g.webp"),
					pdf: upload("A6.pdf"),
				},
				{
					label: "How Majeurs Work",
					title: "For developers, estates, and serviced-apartment operators",
					image: upload("elementor/thumbs/For-developers-estates-and-serviced-apartment-operators--rtufvp9e83y2ihqprfyda9bh039if7my8eekubr0q8.jpeg"),
					pdf: upload("A7.pdf"),
				},
			],
			{ itemLabel: "catalogue" },
		),

		downloadLabel: text("Catalogues: download button", "Download"),
		dialogTitle: text("Download form: title", "Download our catalogue"),
		dialogText: text("Download form: intro", "Fill the form below to get access to our catalogue."),
		dialogThanks: text("Download form: thank-you message", "Thank you. Your catalogue is ready."),
		dialogPdfLabel: text("Download form: PDF button", "Download PDF"),
	},
});
