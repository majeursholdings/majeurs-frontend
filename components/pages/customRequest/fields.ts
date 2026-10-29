import type { FormFieldConfig, SelectOption } from "@/components/customForm/types";

/** Option list from lib/forms/enquiries.ts -> select options */
export const toOptions = (list: readonly string[]): SelectOption[] => list.map((value) => ({ label: value, value }));

const req = { required: true } as const;

/** Name, email, phone and location fields as on the WP forms (placeholders copied from WP) */
export const contactFields = {
	firstName: { name: "first_name", type: "text", label: "First name", placeholder: "John", autoComplete: "given-name", validation: req },
	lastName: { name: "last_name", type: "text", label: "Last name", placeholder: "Doe", autoComplete: "family-name" },
	email: { name: "email", type: "email", label: "Email", placeholder: "name@email.com", autoComplete: "email", validation: req },
	phone: { name: "phone", type: "tel", label: "Phone number", placeholder: "2349012345678", autoComplete: "tel", inputMode: "tel", validation: req },
	location: { name: "location", type: "text", label: "Location (city, country)", placeholder: "Example (Lagos, Nigeria)", autoComplete: "address-level2", validation: req },
	furnitureType: { name: "furniture_type", type: "text", label: "Furniture type(s)", placeholder: "Example (3 seater L-Shaped style sofa)", validation: req },
	message: {
		name: "message",
		type: "textarea",
		label: "Message",
		placeholder: "Tell us about use, style, quantities, access constraints, sustainability preferences, etc",
		rows: 4,
	},
} satisfies Record<string, FormFieldConfig>;

export const required = req;
