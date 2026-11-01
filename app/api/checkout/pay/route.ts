import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { checkoutErrorResponse, payForOrder } from "@/lib/api/checkout";

const paySchema = z.object({
	orderId: z.number().int().positive(),
	orderKey: z.string().regex(/^wc_order_\w+$/),
	paymentMethod: z.string().min(1).max(50),
	paymentData: z.array(z.object({ key: z.string().max(100), value: z.string().max(5000) })).max(20).default([]),
});

/** POST /api/checkout/pay { orderId, orderKey, paymentMethod, paymentData }: pays for an existing order */
export async function POST(request: Request) {
	const parsed = paySchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: "Invalid payment." }, { status: 400 });
	const { orderId, orderKey, paymentMethod, paymentData } = parsed.data;
	try {
		return Response.json(await payForOrder({ orderId, orderKey, payment_method: paymentMethod, payment_data: paymentData }));
	} catch (error) {
		unstable_rethrow(error);
		return checkoutErrorResponse(error);
	}
}
