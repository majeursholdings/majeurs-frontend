import { definePage, link, text, textarea } from "../model.ts";

export const tradeThanks = definePage({
	id: "tradeThanks",
	wpId: 6204,
	path: "/majeurs-trade-program/majeurs-trade-program-registration-completed/",
	title: "Trade Program thank-you page content",
	fields: {
		eyebrow: text("Label", "Majeurs Trade Program"),
		title: text("Title", "Thank You for Registering"),
		message: textarea(
			"Message",
			"Your Trade Programme registration has been received. Our team will review your details, and a member of the Majeurs team will be in touch directly to discuss your project and next steps.",
		),
		cta: link("Extra link", { label: "Discuss Your Project", href: "/get-a-quote-for-custom-made-furniture-in-lagos/" }, "Shown under the message; the shop and home buttons are always there. Leave empty to hide it."),
	},
});
