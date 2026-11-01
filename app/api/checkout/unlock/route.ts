import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { unlockOrder } from "@/lib/api/checkout";

const unlockSchema = z.object({
	orderId: z.number().int().positive(),
	orderKey: z.string().regex(/^wc_order_\w+$/),
	email: z.string().trim().email("Please enter a valid email address"),
});

/** POST /api/checkout/unlock { orderId, orderKey, email }: opens an order from its email link in another browser */
export async function POST(request: Request) {
	const parsed = unlockSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
	try {
		if (await unlockOrder(parsed.data.orderId, parsed.data.orderKey, parsed.data.email)) return Response.json({ ok: true });
		return Response.json({ message: "That email address doesn't match this order." }, { status: 403 });
	} catch (error) {
		unstable_rethrow(error);
		console.error(error);
		return Response.json({ message: "We couldn't check your order right now. Please try again." }, { status: 502 });
	}
}
