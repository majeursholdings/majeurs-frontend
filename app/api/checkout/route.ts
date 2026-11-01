import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { checkoutErrorResponse, placeOrder } from "@/lib/api/checkout";
import { checkoutSchema, toStoreAddresses } from "@/lib/checkout/schema";

const orderSchema = z.object({
	values: checkoutSchema,
	/** gateway fields from the browser, e.g. the Stripe PaymentMethod id */
	paymentData: z.array(z.object({ key: z.string().max(100), value: z.string().max(5000) })).max(20).default([]),
	/** the total shown when "Place order" was pressed, minor units */
	expectedTotal: z.number().int().min(0).optional(),
});

/** POST /api/checkout { values, paymentData, expectedTotal }: places the order and answers where to send the customer next */
export async function POST(request: Request) {
	const parsed = orderSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		return Response.json({ message: parsed.error.issues[0]?.message ?? "Please check your details." }, { status: 400 });
	}
	const { values, paymentData, expectedTotal } = parsed.data;
	try {
		const order = await placeOrder({
			...toStoreAddresses(values),
			payment_method: values.payment_method,
			payment_data: paymentData,
			customer_note: values.note,
			newsletter: values.newsletter,
			expected_total: expectedTotal,
		});
		return Response.json(order);
	} catch (error) {
		unstable_rethrow(error);
		return checkoutErrorResponse(error);
	}
}
