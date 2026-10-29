import { getFx } from "@/lib/api/currency";
import { getProducts, toCard } from "@/lib/api/store";

/** GET /api/products?include=1,2,3: product cards in the visitor's currency (used by the wishlist) */
export async function GET(request: Request) {
	const include = (new URL(request.url).searchParams.get("include") ?? "")
		.split(",")
		.map(Number)
		.filter((id) => Number.isInteger(id) && id > 0)
		.slice(0, 100);
	if (!include.length) return Response.json([]);

	try {
		const [{ products }, fx] = await Promise.all([getProducts({ include, perPage: include.length }), getFx()]);
		return Response.json(products.map((p) => toCard(p, fx)));
	} catch (error) {
		console.error(error);
		return Response.json({ message: "Products are unavailable right now." }, { status: 502 });
	}
}
