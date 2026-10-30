import { definePage, image, link, list, text, textarea, upload } from "../model.ts";

export const events = definePage({
	id: "events",
	wpId: 78,
	path: "/events/",
	title: "Events page content",
	fields: {
		heroTitle: text("Hero: title", "Events"),
		heroText: text("Hero: text", "Launches, open days and talks from the Majeurs workshop in Lagos."),
		heroImage: image("Hero: image", upload("Atunlo-Collection-SetUp.webp")),

		introEyebrow: text("Intro: label", "Events at Majeurs"),
		introTitle: text("Intro: title", "Come and see the work up close"),
		introText: textarea(
			"Intro: text",
			"When we launch a collection, open the showroom for a day or take part in a design event, you will find the date, the place and how to join us here.",
		),

		items: list(
			"Events",
			{
				title: text("Title"),
				date: text("Date", "", "As it should read, e.g. Saturday 14 November 2026, 11am–4pm"),
				location: text("Location"),
				description: textarea("Description"),
				image: image("Image", "", "Landscape, 4:3"),
				cta: link("Button", undefined, "e.g. Register, or a link to the event page. Leave empty for no button."),
			},
			[],
			{ itemLabel: "event", instructions: "Upcoming events, soonest first. Remove an event once it has passed." },
		),
		emptyText: textarea(
			"No events: message",
			"No upcoming events right now. Check back soon, or plan a visit to our Lagos showroom to see the collections in person.",
			"Shown when the events list is empty.",
		),

		visitEyebrow: text("Showroom visit: label", "Visit us"),
		visitTitle: text("Showroom visit: title", "Plan a showroom visit"),
		visitText: textarea(
			"Showroom visit: text",
			"See the collections in person, feel the fabrics and finishes, and talk through your project with our team. Pick a time that suits you and we will have everything ready.",
		),
		visitImage: image("Showroom visit: image", upload("contact-majeurs-furniture-brand-lagos-nigeria.webp")),
		visitCta: link("Showroom visit: button", { label: "Plan a visitation", href: "/plan-a-visitation/" }),
	},
});
