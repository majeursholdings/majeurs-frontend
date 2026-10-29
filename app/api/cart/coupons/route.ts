import { z } from "zod";
import { applyCoupon, cartErrorResponse, removeCoupon } from "@/lib/api/cart";

const couponSchema = z.object({ code: z.string().trim().min(1).max(100) });

/** POST /api/cart/coupons { code } */
export async function POST(request: Request) {
	const parsed = couponSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: "Please enter a coupon code." }, { status: 400 });
	try {
		return Response.json(await applyCoupon(parsed.data.code));
	} catch (error) {
		return cartErrorResponse(error);
	}
}

/** DELETE /api/cart/coupons?code=… */
export async function DELETE(request: Request) {
	const parsed = couponSchema.safeParse({ code: new URL(request.url).searchParams.get("code") });
	if (!parsed.success) return Response.json({ message: "Invalid coupon." }, { status: 400 });
	try {
		return Response.json(await removeCoupon(parsed.data.code));
	} catch (error) {
		return cartErrorResponse(error);
	}
}
