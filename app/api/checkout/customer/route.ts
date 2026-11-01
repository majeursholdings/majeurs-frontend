import { z } from "zod";
import { cartErrorResponse, updateCustomer } from "@/lib/api/cart";

const address = z
	.object({
		first_name: z.string().max(200),
		last_name: z.string().max(200),
		company: z.string().max(200),
		address_1: z.string().max(200),
		address_2: z.string().max(200),
		city: z.string().max(200),
		state: z.string().max(200),
		postcode: z.string().max(40),
		country: z.string().max(2),
		phone: z.string().max(40),
		email: z.string().max(200),
	})
	.partial();

const customerSchema = z.object({ shipping_address: address.optional(), billing_address: address.optional() });

/** POST /api/checkout/customer { shipping_address?, billing_address? }: saves the address, answers the cart with its shipping rates */
export async function POST(request: Request) {
	const parsed = customerSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return Response.json({ message: "Invalid address." }, { status: 400 });
	try {
		return Response.json(await updateCustomer(parsed.data));
	} catch (error) {
		return cartErrorResponse(error);
	}
}
