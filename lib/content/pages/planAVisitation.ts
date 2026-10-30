import { definePage, image, link, text, textarea, upload } from "../model.ts";

export const planAVisitation = definePage({
	id: "planAVisitation",
	wpId: 1186,
	path: "/plan-a-visitation/",
	title: "Plan a visitation page content",
	fields: {
		heroTitle: text("Hero: title", "Plan A Visitation"),
		heroText: text("Hero: text", "We accept walk-in customers in our factory and showrooms only by appointment."),
		heroImage: image("Hero: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),

		scheduleTitle: text("Schedule: title", "Schedule a Date"),
		scheduleText: textarea(
			"Schedule: text",
			"Book a time with our in-store brand specialists, either digitally or in person, for your furniture styling consultations, shopping advice, or a personal walk-through of our latest collections from the World of Majeurs Holdings.",
		),
		scheduleImage: image("Schedule: image", upload("Placing_chair_and_table_2K_202609042308-scaled.webp")),
		scheduleImageAlt: text("Schedule: image description", "A Majeurs armchair and side table being placed in a showroom", "Alt text for screen readers"),
		locationsCta: link("Schedule: locations button", { label: "Store locations", href: "/showrooms/" }),
		bookCta: link("Schedule: booking button", { label: "Book consultation", href: "#book" }, "#book jumps to the form below"),

		formTitle: text("Form: title", "Book your visit"),

		ctaImage: image("Closing banner: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),
	},
});
