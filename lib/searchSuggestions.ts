// Shared by the suggestions route (app/api/search/suggestions) and SearchForm (client), so keep it free of server imports

/** Suggestions start once the visitor has typed this many characters */
export const SUGGEST_MIN_CHARS = 3;

/** Products for the header and shop searches, blog posts for the blog search */
export type SuggestionSource = "products" | "posts";

export type Suggestion = {
	id: string;
	title: string;
	href: string;
	image?: string;
	/** Small line above the title, e.g. the product's category or the post's first category */
	eyebrow?: string;
	/** Line under the title, e.g. "From ₦611,178.93" */
	meta?: string;
};
