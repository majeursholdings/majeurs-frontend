import { hasSession, removeFromWishlist, wishlistErrorResponse } from "@/lib/api/account";

/** DELETE /api/wishlist/:id */
export async function DELETE(_request: Request, { params }: RouteContext<"/api/wishlist/[id]">) {
	const id = Number((await params).id);
	if (!Number.isInteger(id) || id <= 0) return Response.json({ message: "Invalid product." }, { status: 400 });
	if (!(await hasSession())) return Response.json({ signedIn: false, ids: [] });
	try {
		return Response.json({ signedIn: true, ids: await removeFromWishlist(id) });
	} catch (error) {
		return wishlistErrorResponse(error);
	}
}
