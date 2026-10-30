import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

const demo = { label: "Book a Demo", href: "https://www.mande.com.ng/contact-mande", external: true };
const earlyAccess = { label: "Early Access", href: "https://www.mande.com.ng/manufacturer/registration", external: true };

export const mande = definePage({
	id: "mande",
	wpId: 101,
	path: "/mande/",
	title: "Mande page content",
	fields: {
		heroTitle: text("Hero: title", "MANDE"),
		heroText: text("Hero: text", "A community of talented furniture makers."),
		heroImage: image("Hero: image", upload("close-up-shoot-showing-Majeurs-workman-making-a-marking-on-a-wood-piece.webp")),

		aboutTitle: text("About: title", "About MANDE"),
		aboutText: textarea(
			"About: text",
			"Mande is where craft meets innovation. Our trainees and makers have access to high-quality industrial machinery and technical resources. Mande, which specializes in production for local projects, connects our best talent with opportunities to shape the future of furniture manufacturing.",
		),
		aboutImage: image("About: image", upload("close-up-shoot-showing-Majeurs-workman-working-on-a-wood-piece.webp")),
		aboutImageAlt: text("About: image description", "Close-up of a Majeurs workman working on a wood piece", "Alt text for screen readers"),
		aboutCtas: list("About: buttons", { cta: link("Button") }, [{ cta: demo }, { cta: earlyAccess }]),

		accessEyebrow: text("Full access: label", "Full Access"),
		accessTitle: text("Full access: title", "Mande Makers Early Bird Registration ₦65,000"),
		accessPerks: list(
			"Full access: what's included",
			{ perk: text("Item") },
			[
				{ perk: "Unlimited factory floor & machine access" },
				{ perk: "Dedicated tech/CAD suite & material library" },
				{ perk: "24/7 on-site mentorship & business coaching" },
				{ perk: "Fast-track entry to the Mande Accelerator" },
				{ perk: "Preferred rates on raw materials & logistics" },
			],
			{ itemLabel: "item" },
		),
		accessImage: image("Full access: image", upload("close-up-shoot-showing-Majeurs-workman-making-a-measurement-marking-on-a-wood-piece.webp")),
		accessImageAlt: text(
			"Full access: image description",
			"Close-up of a Majeurs workman making a measurement marking on a wood piece",
			"Alt text for screen readers",
		),
		accessCtas: list("Full access: buttons", { cta: link("Button") }, [{ cta: demo }, { cta: earlyAccess }]),
	},
});
