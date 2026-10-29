import { getFx } from "@/lib/api/currency";
import { getPosts } from "@/lib/api/posts";
import { getProducts, toCard } from "@/lib/api/store";
import { SUGGEST_MIN_CHARS, type Suggestion } from "@/lib/searchSuggestions";

const LIMIT = 6;

/**
 * GET /api/search/suggestions?q=sofa&source=products|posts[&category=sofas|&tag=…]: a few matches for SearchForm's dropdown.
 * Products are priced in the visitor's currency. Both lists come from the cached Store API / WP fetches.
 */
export async function GET(request: Request) {
	const params = new URL(request.url).searchParams;
	const q = (params.get("q") ?? "").trim().slice(0, 100);
	if (q.length < SUGGEST_MIN_CHARS) return Response.json([]);

	try {
		if (params.get("source") === "posts") {
			const { posts } = await getPosts({ search: q, perPage: LIMIT });
			return Response.json(
				posts.map<Suggestion>((post) => ({ id: post.href, title: post.title, href: post.href, image: post.image, eyebrow: post.categories?.[0] })),
			);
		}

		// on a category or tag page, suggest from that archive only (SearchForm `scope`)
		const slug = (name: string) => (/^[a-z0-9-]+$/.test(params.get(name) ?? "") ? params.get(name)! : undefined);
		const [{ products }, fx] = await Promise.all([getProducts({ search: q, category: slug("category"), tag: slug("tag"), perPage: LIMIT }), getFx()]);
		return Response.json(
			products.map<Suggestion>((p) => {
				const card = toCard(p, fx);
				return { id: String(card.id), title: card.name, href: card.href, image: card.images[0]?.src, eyebrow: card.category, meta: card.price };
			}),
		);
	} catch (error) {
		console.error(error);
		return Response.json({ message: "Suggestions are unavailable right now." }, { status: 502 });
	}
}
