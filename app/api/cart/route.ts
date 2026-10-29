import { cartErrorResponse, getCart } from "@/lib/api/cart";

/** GET /api/cart: the visitor's cart, priced in their currency */
export async function GET() {
	try {
		return Response.json(await getCart());
	} catch (error) {
		return cartErrorResponse(error);
	}
}
