import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { checkoutErrorResponse, confirmStripeOrder, orderReceivedPath } from "@/lib/api/checkout";

const confirmSchema = z.object({
	orderId: z.coerce.number().int().positive(),
	orderKey: z.string().regex(/^wc_order_\w+$/),
	intentId: z.string().regex(/^(pi|seti)_\w+$/),
	nonce: z.string().regex(/^\w+$/).max(20),
});

/** POST /api/checkout/stripe { orderId, orderKey, intentId, nonce }: after 3-D Secure in the page, settles the order */
export async function POST(request: Request) {
	const parsed = confirmSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: "Invalid payment confirmation." }, { status: 400 });
	try {
		return Response.json({ redirect: await confirmStripeOrder(parsed.data) });
	} catch (error) {
		unstable_rethrow(error);
		return checkoutErrorResponse(error);
	}
}

/**
 * GET /api/checkout/stripe?order=&key=&nonce=&payment_intent=…: Stripe's return_url when a payment method
 * leaves the page to authenticate. Settles the order, then shows its order-received page (or the checkout
 * again when the payment didn't go through).
 */
export async function GET(request: Request) {
	const url = new URL(request.url);
	const parsed = confirmSchema.safeParse({
		orderId: url.searchParams.get("order"),
		orderKey: url.searchParams.get("key"),
		intentId: url.searchParams.get("payment_intent") ?? url.searchParams.get("setup_intent"),
		nonce: url.searchParams.get("nonce"),
	});
	if (!parsed.success) return NextResponse.redirect(new URL("/checkout/", url), 303);
	try {
		return NextResponse.redirect(new URL(await confirmStripeOrder(parsed.data), url), 303);
	} catch (error) {
		unstable_rethrow(error);
		// Stripe says it took the payment: show the order (Stripe's webhook settles it), never "you haven't been charged"
		if (["succeeded", "processing"].includes(url.searchParams.get("redirect_status") ?? "")) {
			return NextResponse.redirect(new URL(orderReceivedPath(parsed.data.orderId, parsed.data.orderKey), url), 303);
		}
		const back = new URL("/checkout/", url);
		back.searchParams.set("payment", "failed");
		return NextResponse.redirect(back, 303);
	}
}
