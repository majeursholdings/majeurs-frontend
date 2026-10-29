import { z } from "zod";
import { addToWishlist, getWishlist, hasSession, wishlistErrorResponse } from "@/lib/api/account";

/**
 * The signed-in customer's wishlist (docs/wordpress/majeurs-account.php). Signed out, or before that snippet is
 * installed, answers { signedIn: false } and the browser keeps the list in localStorage.
 */
export async function GET() {
	if (!(await hasSession())) return Response.json({ signedIn: false, ids: [] });
	try {
		return Response.json({ signedIn: true, ids: await getWishlist() });
	} catch (error) {
		return wishlistErrorResponse(error);
	}
}

const addSchema = z.object({ ids: z.array(z.number().int().positive()).min(1).max(200) });

/** POST /api/wishlist { ids }: adds to the account's list and returns all of it */
export async function POST(request: Request) {
	const parsed = addSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: "Invalid products." }, { status: 400 });
	if (!(await hasSession())) return Response.json({ signedIn: false, ids: [] });
	try {
		return Response.json({ signedIn: true, ids: await addToWishlist(parsed.data.ids) });
	} catch (error) {
		return wishlistErrorResponse(error);
	}
}
