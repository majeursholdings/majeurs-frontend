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
				email: text("Email", "", "Leave empty to hide."),
				phone: text("Phone", "", "As it should read, e.g. +234 201 330 6192. Leave empty to hide."),
			},
			[
				{ title: "Corporate headquarters", address: "32, QMB Builders Mart Road, Opposite Elf Bus Stop, Lekki Phase 1, Lagos State, Nigeria. 105102", email: "", phone: "+234 201 330 6192" },
				{ title: "United Kingdom office", address: "71–75 Shelton Street, Covent Garden, London, WC2H 9JQ", email: "", phone: "+44 7936 520391" },
				{ title: "Customer service", address: "", email: "customerservice@majeursholdings.com", phone: "+234 906 599 2520" },
				{ title: "Partnership", address: "", email: "b.strategy@majeursholdings.com", phone: "+234 201 330 6192" },
			],
			{ itemLabel: "contact group" },
		),

		socialTitle: text("Social media: title", "Social media"),
	},
});
