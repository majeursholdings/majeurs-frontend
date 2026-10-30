import { definePage, link, text, textarea } from "../model.ts";

export const careers = definePage({
	id: "careers",
	wpId: 788,
	path: "/career/",
	title: "Careers page content",
	fields: {
		introTitle: text("Intro: title", "Come Join Majeurs"),
		introText: textarea(
			"Intro: text",
			"Majeurs is a design-led, tech-enabled manufacturing brand building the future of African furniture. We operate across production, retail, academy training, and digital platforms, and we are scaling.\n\nIf making an impact gives you a reason to roll out of bed in the mornings, come join us!",
		),
		introCta: link("Intro: button", { label: "See open positions", href: "#openings" }, "#openings jumps to the list of openings"),

		openingsTitle: text("Openings: title", "Current Openings at Majeurs", "The openings themselves are the Careers posts in wp-admin"),
		openingsEmpty: text("Openings: text when there are none", "There are no openings right now. Check back soon."),
	},
});
