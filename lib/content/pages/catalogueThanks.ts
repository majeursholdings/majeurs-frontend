import { definePage, link, text, textarea } from "../model.ts";

export const catalogueThanks = definePage({
	id: "catalogueThanks",
	wpId: 6686,
	path: "/catalogue/check-your-inbox-for-catalogue/",
	title: "Catalogue thank-you page content",
	fields: {
		eyebrow: text("Label", "Catalogue request"),
		title: text("Title", "Check Your Inbox"),
		message: textarea("Message", "Your Majeurs catalogue is on its way to your email."),
		cta: link("Extra link", { label: "More Catalogues", href: "/catalogue/" }, "Shown under the message; the shop and home buttons are always there. Leave empty to hide it."),
	},
});
