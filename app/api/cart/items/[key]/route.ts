import { z } from "zod";
import { cartErrorResponse, removeCartItem, updateCartItem } from "@/lib/api/cart";

const updateSchema = z.object({ quantity: z.number().int().min(1).max(99) });

/** PATCH /api/cart/items/:key { quantity } */
export async function PATCH(request: Request, { params }: RouteContext<"/api/cart/items/[key]">) {
	const { key } = await params;
	const parsed = updateSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: "Invalid quantity." }, { status: 400 });
	try {
		return Response.json(await updateCartItem(key, parsed.data.quantity));
	} catch (error) {
		return cartErrorResponse(error);
	}
}

/** DELETE /api/cart/items/:key */
export async function DELETE(_request: Request, { params }: RouteContext<"/api/cart/items/[key]">) {
	const { key } = await params;
	try {
		return Response.json(await removeCartItem(key));
	} catch (error) {
		return cartErrorResponse(error);
	}
}
