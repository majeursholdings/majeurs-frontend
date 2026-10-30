import { definePage, rich, text } from "../model.ts";

export const cookiePolicy = definePage({
	id: "cookiePolicy",
	wpId: 5251,
	path: "/cookie-policy/",
	title: "Cookie Policy page content",
	fields: {
		title: text("Title", "Cookie Policy"),
		lastUpdated: text("Last updated", "", "Shown under the title, e.g. “Last updated 28 January 2026”. Leave empty to hide it."),
		body: rich("Policy text", "", "The policy itself. Empty on the old site too: write it here."),
	},
});
