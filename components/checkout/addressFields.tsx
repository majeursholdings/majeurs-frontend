"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormField } from "@/components/customForm";
import type { FormFieldConfig } from "@/components/customForm/types";
import { countryOptions, fieldRule, statesOf, type AddressField } from "@/lib/checkout/countries";
import type { CheckoutInput } from "@/lib/checkout/schema";

const autoComplete: Record<AddressField | "country", string> = {
	country: "country",
	first_name: "given-name",
	last_name: "family-name",
	company: "organization",
	address_1: "address-line1",
	address_2: "address-line2",
	city: "address-level2",
	state: "address-level1",
	postcode: "postal-code",
	phone: "tel",
};

/** Rows of the address form; a lone field takes the full width */
const ROWS: (AddressField | "country")[][] = [["country"], ["first_name", "last_name"], ["address_1"], ["address_2"], ["city", "state"], ["postcode", "phone"]];

/**
 * One address (shipping "s" or billing "b"), laid out like the block checkout. Labels, required fields and
 * hidden fields follow the chosen country (WooCommerce's rules, lib/checkout/countries.ts): Nigeria has no
 * postcode, countries with a state list get a picker.
 */
export function AddressFields({ prefix, shippingOnly = false }: { prefix: "s" | "b"; shippingOnly?: boolean }) {
	const { register, control, getValues, setValue, formState } = useFormContext<CheckoutInput>();
	const country = useWatch({ control, name: `${prefix}_country` }) ?? "";
	const states = statesOf(country);
	const section = prefix === "s" ? "shipping" : "billing";

	const config = (field: AddressField | "country"): FormFieldConfig | null => {
		const name = `${prefix}_${field}`;
		const base = { name, autoComplete: `${section} ${autoComplete[field]}` };
		if (field === "country") {
			return {
				...base,
				type: "combobox",
				label: "Country/Region",
				options: countryOptions.filter((c) => !shippingOnly || c.shipping),
				emptyMessage: "No country matches",
				validation: { required: true },
			};
		}
		const rule = fieldRule(field, country);
		if (rule.hidden) return null;
		const label = rule.required ? rule.label : `${rule.label} (optional)`;
		if (field === "state" && states) {
			return { ...base, type: "combobox", label, options: Object.entries(states).map(([value, label]) => ({ value, label })), emptyMessage: "No state matches", validation: { required: rule.required } };
		}
		return { ...base, type: field === "phone" ? "tel" : "text", label, validation: { required: rule.required } };
	};

	return (
		<div className="grid gap-4">
			{ROWS.map((row) => {
				const fields = row.map(config).filter((f): f is FormFieldConfig => f !== null);
				if (!fields.length) return null;
				return (
					<div key={row.join("-")} className="flex flex-col gap-4 md:flex-row">
						{fields.map((field) => (
							<FormField<CheckoutInput>
								key={field.name}
								field={field}
								register={register}
								control={control}
								getValues={getValues}
								setValue={setValue}
								errors={formState.errors}
							/>
						))}
					</div>
				);
			})}
		</div>
	);
}
