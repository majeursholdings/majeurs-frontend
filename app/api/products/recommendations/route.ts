import { getFx } from "@/lib/api/currency";
import { getCartRecommendations } from "@/lib/api/product";
import { toCard } from "@/lib/api/store";

/** GET /api/products/recommendations?for=slug-a,slug-b: the cart page's two rails, as cards in the visitor's currency */
export async function GET(request: Request) {
	const slugs = (new URL(request.url).searchParams.get("for") ?? "")
		.split(",")
		.map((slug) => slug.trim())
		.filter((slug) => /^[a-z0-9%-]+$/i.test(slug))
		.slice(0, 10);
	if (!slugs.length) return Response.json({ completeTheRoom: [], youMightAlsoLike: [] });

	try {
		const [rails, fx] = await Promise.all([getCartRecommendations(slugs), getFx()]);
		return Response.json({
			completeTheRoom: rails.completeTheRoom.map((p) => toCard(p, fx)),
			youMightAlsoLike: rails.youMightAlsoLike.map((p) => toCard(p, fx)),
		});
	} catch (error) {
		console.error(error);
		return Response.json({ message: "Recommendations are unavailable right now." }, { status: 502 });
	}
}
