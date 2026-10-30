import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

export const bespokeProduct = definePage({
	id: "bespokeProduct",
	wpId: 80,
	path: "/bespoke-product/",
	title: "Bespoke product page content",
	fields: {
		heroTitle: text("Hero: title", "Bespoke Product"),
		heroText: text("Hero: text", "Furniture made to your size, finish and style, from first sketch to final detail."),
		heroImage: image("Hero: image", upload("Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp")),

		introEyebrow: text("Intro: label", "Made to commission"),
		introTitle: text("Intro: title", "Your piece, built from scratch"),
		introText: textarea(
			"Intro: text",
			"Have an idea for your space? Let’s build it, from first sketch to final detail. From long sofas to full office furniture sets, home offices, bedroom sets, kitchens and built-ins, everything is tailored to fit your space and your style.\n\nWhether you already have a plan or just a rough idea, our designers and craftsmen will help you bring it to life.",
		),
		introImage: image("Intro: image", upload("Majeurs-workman-actively-working-on-a-Atunlo-collection-design.webp")),
		introImageAlt: text("Intro: image description", "A Majeurs craftsman working on a bespoke piece", "Alt text for screen readers"),
		introCtas: list("Intro: buttons", { cta: link("Button") }, [
			{ cta: { label: "Start a custom request", href: "/custom-made-furniture-in-lagos/" } },
			{ cta: { label: "Get a quote", href: "/get-a-quote-for-custom-made-furniture-in-lagos/" } },
		]),

		steps: list(
			"Steps",
			{ title: text("Title"), text: textarea("Text") },
			[
				{ title: "Share your idea", text: "A sketch, a photo or a rough idea: tell us the piece, the space and how it will be used." },
				{ title: "Design and quote", text: "We propose dimensions, materials and finishes, with a quote and a delivery window, usually within 24 hours." },
				{ title: "Made in Lagos", text: "Your piece is handcrafted in our Lagos workshop, then delivered and installed by our team." },
			],
			{ itemLabel: "step" },
		),
	},
});
