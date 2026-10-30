import { definePage, link, text, textarea } from "../model.ts";

export const quoteThanks = definePage({
	id: "quoteThanks",
	wpId: 6767,
	path: "/get-a-quote-for-custom-made-furniture-in-lagos/quote-request-received/",
	title: "Quote request thank-you page content",
	fields: {
		eyebrow: text("Label", "Quote request"),
		title: text("Title", "Request Received"),
		message: textarea(
			"Message",
			"Thank you for reaching out. Our team will review your project details and get back to you within 24 hours.\n\nIn the meantime, feel free to browse our catalogues or explore our shop for inspiration.",
		),
		cta: link("Extra link", { label: "Our Catalogues", href: "/catalogue/" }, "Shown under the message; the shop and home buttons are always there. Leave empty to hide it."),
	},
});
