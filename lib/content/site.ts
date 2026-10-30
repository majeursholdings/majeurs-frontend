import { defineSite, image, link, list, text, textarea, upload, type SiteContent } from "./model.ts";

/** "Customize your furniture style" band (components/marketing/customizeCta.tsx). A page can still pass its own image. */
export const customizeCtaContent = defineSite({
	id: "customizeCta",
	title: "Band: Customize your furniture style",
	fields: {
		eyebrow: text("Label", "Customize your furniture style"),
		title: text("Title", "Complete your dream home with your dream furniture style"),
		cta: link("Button", { label: "Create your style", href: "/custom-made-furniture-in-lagos/" }),
		image: image("Background image", upload("The-Atunlo-collection-sketch-work-done-by-Demi-Samande.webp"), "Used where a page doesn't set its own."),
	},
});

/** Wood-grain "Shop Now" closer (components/landing/shopNowBand.tsx) */
export const shopNowBandContent = defineSite({
	id: "shopNowBand",
	title: "Band: Shop Now",
	fields: {
		sign: text("Sign", "Shop Now"),
		photo: image("Photo", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),
		photoAlt: text("Photo: description", "Majeurs showroom sofa", "Read out by screen readers."),
		background: image("Wood background", upload("wood-skin.webp")),
		text: textarea(
			"Text",
			"Our passion lies in creating a collection that embodies sophistication, elegance, and timeless design. We strive to be more than just another furniture manufacturer; we aim to be a destination where individuals and businesses with a love for opulence and style can discover and embrace the art of luxury living.",
		),
		cta: link("Button", { label: "Let's shop", href: "/shop/" }),
	},
});

/** "Need help?" strip on the FAQ and Contact pages (components/pages/faqsPage/helpBar.tsx) */
export const helpBarContent = defineSite({
	id: "helpBar",
	title: "Strip: Need help?",
	fields: {
		label: text("Label", "Need help?"),
		links: list(
			"Links",
			{ cta: link("Link") },
			[
				{ cta: { label: "Contact us", href: "/contact-majeurs-holdings/" } },
				{ cta: { label: "FAQ", href: "/faqs/" } },
				{ cta: { label: "Product care", href: "/furniture-care-service/" } },
			],
			{ itemLabel: "link" },
		),
	},
});

/** /project/ has no WordPress page (it's the project archive), so its copy lives here */
export const projectsArchiveContent = defineSite({
	id: "projectsArchive",
	title: "Page: Projects (/project/)",
	fields: {
		heroTitle: text("Hero: title", "Majeurs Projects"),
		heroText: text(
			"Hero: text",
			"Majeurs Furniture's project portfolio showcases some of our team's completed residential and outdoor design projects. From completed renovations to complete setup projects, see how we turn ordinary spaces into extraordinary dream spaces.",
		),
		cardButton: text("Project card: button", "View project"),
		emptyText: text("No projects message", "New projects are on the way. Check back soon."),
		bannerImage: image("Closing banner: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),
	},
});

/** Every Site content section; scripts/content.mts turns these into field groups on the Site content screen */
export const siteSections: SiteContent[] = [customizeCtaContent, shopNowBandContent, helpBarContent, projectsArchiveContent];
