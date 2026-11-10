import { definePage, image, list, text, upload } from "../model.ts";

export const contact = definePage({
	id: "contact",
	wpId: 72,
	path: "/contact-majeurs-holdings/",
	title: "Contact page content",
	fields: {
		heroTitle: text("Hero: title", "Contact Majeurs"),
		heroImage: image("Hero: image", upload("wood-skin-1.webp")),

		offices: list(
			"Contact details",
			{
				title: text("Title"),
				address: text("Address", "", "Links to Google Maps. Leave empty to hide."),
				email: text("Email", "", "Leave empty to hide. {email} is the Contact details email (Site content)."),
				phone: text("Phone", "", "As it should read, e.g. +44 7936 520391. {phone} is the Contact details number (Site content). Leave empty to hide."),
			},
			[
				{ title: "Corporate headquarters", address: "32, QMB Builders Mart Road, Opposite Elf Bus Stop, Lekki Phase 1, Lagos State, Nigeria. 105102", email: "", phone: "{phone}" },
				{ title: "United Kingdom office", address: "71-75 Shelton Street, Covent Garden, London, WC2H 9JQ", email: "", phone: "+44 7936 520391" },
				{ title: "Customer service", address: "", email: "{email}", phone: "{phone}" },
			],
			{ itemLabel: "contact group" },
		),

		socialTitle: text("Social media: title", "Social media"),
	},
});
