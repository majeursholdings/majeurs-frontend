import { z } from "zod";
import { cartErrorResponse, selectShippingRate } from "@/lib/api/cart";

const rateSchema = z.object({ packageId: z.number().int().min(0), rateId: z.string().min(1).max(100) });

/** POST /api/checkout/shipping { packageId, rateId }: picks a delivery option (or showroom pickup) */
export async function POST(request: Request) {
	const parsed = rateSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: "Invalid delivery option." }, { status: 400 });
	try {
		return Response.json(await selectShippingRate(parsed.data.packageId, parsed.data.rateId));
	} catch (error) {
		return cartErrorResponse(error);
	}
}
