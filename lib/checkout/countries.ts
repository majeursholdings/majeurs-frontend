// Shared by the checkout form (client) and the checkout route, so keep it free of server imports
import data from "./countryData.json";

/** Address fields whose label / required / hidden WooCommerce sets per country */
export type AddressField = "first_name" | "last_name" | "company" | "address_1" | "address_2" | "city" | "state" | "postcode" | "phone";
type FieldRule = { label: string; required: boolean; hidden: boolean };

const countries = data.countries as Record<string, { name: string; shipping: boolean }>;
const states = data.states as Record<string, Record<string, string>>;
const locale = data.locale as Record<string, Partial<Record<AddressField, Partial<FieldRule>>>>;
const defaults = data.fields as Record<AddressField | "email" | "country", FieldRule>;

/** Countries WooCommerce sells to (scripts/checkout-countries.mjs), by name */
export const countryOptions = Object.entries(countries)
	.map(([value, c]) => ({ value, label: c.name, shipping: c.shipping }))
	.sort((a, b) => a.label.localeCompare(b.label));

export const countryName = (code: string) => countries[code]?.name ?? code;

/** state code -> name, or undefined when the country has no state list (a free-text field then) */
export const statesOf = (country: string): Record<string, string> | undefined => states[country];

/**
 * The block checkout's rule for one field in one country: e.g. Nigeria hides the postcode, the UK makes the
 * state optional. Hidden fields are neither shown nor required.
 */
export function fieldRule(field: AddressField, country: string): FieldRule {
	const rule = { ...defaults[field], ...locale[country]?.[field] };
	return rule.hidden ? { ...rule, required: false } : rule;
}

export const DEFAULT_COUNTRY = "NG";
