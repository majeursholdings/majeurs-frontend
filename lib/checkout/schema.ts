// Shared by the checkout form (client) and the checkout route, so keep it free of server imports
import { z } from "zod";
import { DEFAULT_COUNTRY, fieldRule, statesOf, type AddressField } from "./countries";

/** Address field names in the form: "s_" shipping, "b_" billing (MainForm fields are flat) */
export const ADDRESS_FIELDS = ["first_name", "last_name", "address_1", "address_2", "city", "state", "postcode", "phone"] as const satisfies readonly AddressField[];
type Prefix = "s" | "b";

const text = z.string().trim().max(200).default("");
const addressShape = (prefix: Prefix) =>
	Object.fromEntries([...ADDRESS_FIELDS, "country"].map((f) => [`${prefix}_${f}`, f === "country" ? z.string().trim().default(DEFAULT_COUNTRY) : text])) as Record<
		`${Prefix}_${AddressField | "country"}`,
		typeof text
	>;

const messages: Record<string, string> = {
	first_name: "Enter a first name",
	last_name: "Enter a last name",
	address_1: "Enter an address",
	city: "Enter a city",
	state: "Choose a state",
	postcode: "Enter a postal code",
	phone: "Enter a phone number",
};

export const checkoutSchema = z
	.object({
		email: z.string().trim().email("Please enter a valid email address"),
		/** "ship" to an address, or collect from the showroom */
		delivery: z.enum(["ship", "pickup"]).default("ship"),
		...addressShape("s"),
		/** shipping only: bill to the shipping address */
		sameBilling: z.boolean().default(true),
		...addressShape("b"),
		note: z.string().trim().max(2000).default(""),
		newsletter: z.boolean().default(true),
		/** filled in by the checkout from the method on screen; WooCommerce refuses an order that needs payment without one */
		payment_method: z.string().trim().max(50).default(""),
	})
	.superRefine((v, ctx) => {
		for (const prefix of activeAddresses(v)) {
			const country = v[`${prefix}_country`];
			if (!country) ctx.addIssue({ code: "custom", path: [`${prefix}_country`], message: "Choose a country" });
			for (const field of ADDRESS_FIELDS) {
				const value = v[`${prefix}_${field}`];
				if (fieldRule(field, country).required && !value) {
					ctx.addIssue({ code: "custom", path: [`${prefix}_${field}`], message: messages[field] ?? "Required" });
				}
			}
			const states = statesOf(country);
			const state = v[`${prefix}_state`];
			if (states && state && !(state in states)) ctx.addIssue({ code: "custom", path: [`${prefix}_state`], message: messages.state });
		}
	});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutValues = z.output<typeof checkoutSchema>;

/** Which address groups the order needs: shipping when delivered, billing when picked up or billed elsewhere */
export function activeAddresses(v: Pick<CheckoutInput, "delivery" | "sameBilling">): Prefix[] {
	if (v.delivery === "pickup") return ["b"];
	return v.sameBilling === false ? ["s", "b"] : ["s"];
}

type StoreAddressInput = Record<AddressField | "country", string>;

/** One address group of the form -> Store API address (hidden fields sent empty) */
export function addressOf(v: Partial<Record<string, unknown>>, prefix: Prefix): StoreAddressInput {
	const country = String(v[`${prefix}_country`] ?? "");
	const address = { country, company: "" } as StoreAddressInput;
	for (const field of ADDRESS_FIELDS) address[field] = fieldRule(field, country).hidden ? "" : String(v[`${prefix}_${field}`] ?? "").trim();
	return address;
}

/**
 * Form -> the Store API's billing and shipping addresses. Picked-up orders ship to the billing address (as the
 * block checkout does); delivered orders bill to the shipping address unless a billing address was given.
 */
export function toStoreAddresses(v: CheckoutValues) {
	const shipping = addressOf(v, v.delivery === "pickup" ? "b" : "s");
	const billing = v.delivery === "ship" && v.sameBilling ? shipping : addressOf(v, "b");
	return { billing_address: { ...billing, email: v.email }, shipping_address: shipping };
}

/** True once the shipping address has what WooCommerce needs to price delivery */
export function canQuoteShipping(v: Partial<Record<string, unknown>>): boolean {
	const address = addressOf(v, "s");
	if (!address.country) return false;
	return (["address_1", "city", "state", "postcode"] as const).every((f) => !fieldRule(f, address.country).required || address[f]);
}
