import { z } from "zod";
import { addToCart, cartErrorResponse } from "@/lib/api/cart";

const addSchema = z.object({
	id: z.number().int().positive(),
	quantity: z.number().int().min(1).max(99).default(1),
	variation: z.array(z.object({ attribute: z.string(), value: z.string() })).optional(),
});

/** POST /api/cart/items { id, quantity?, variation? } */
export async function POST(request: Request) {
	const parsed = addSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: "Invalid product." }, { status: 400 });
	try {
		return Response.json(await addToCart(parsed.data.id, parsed.data.quantity, parsed.data.variation));
	} catch (error) {
		return cartErrorResponse(error);
	}
}
