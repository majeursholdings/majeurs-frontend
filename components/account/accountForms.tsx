"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import type { FormFieldConfig } from "@/components/customForm/types";
import { updateAddressAction, updateDetailsAction } from "@/app/(commerce)/my-account/actions";
import { accountDetailsSchema, addressSchema, type AccountDetailsInput, type AddressInput } from "@/lib/account/schemas";
import type { AddressBook, AddressFields, Customer } from "@/lib/api/account";

const field = "h-12 bg-white px-4 text-black";

export function AccountDetailsForm({ customer }: { customer: Customer }) {
	const methods = useForm<AccountDetailsInput>({
		mode: "onTouched",
		resolver: zodResolver(accountDetailsSchema),
		defaultValues: {
			first_name: customer.first_name,
			last_name: customer.last_name,
			display_name: customer.display_name,
			email: customer.email,
			current_password: "",
			new_password: "",
			confirm_password: "",
		},
	});

	const onSubmit = async (values: AccountDetailsInput) => {
		const result = await updateDetailsAction(values);
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		toast.success(result.message);
		methods.reset({ ...values, current_password: "", new_password: "", confirm_password: "" });
	};

	return (
		<MainForm<AccountDetailsInput>
			methods={methods}
			requireValidToSubmit={false}
			isLoading={methods.formState.isSubmitting}
			submitLabel="Save changes"
			onSubmit={onSubmit}
			rowPairs={[["first_name", "last_name"]]}
			fields={[
				{ name: "first_name", type: "text", label: "First name", autoComplete: "given-name", className: field, validation: { required: true } },
				{ name: "last_name", type: "text", label: "Last name", autoComplete: "family-name", className: field, validation: { required: true } },
				{
					name: "display_name",
					type: "text",
					label: "Display name",
					description: "This will be how your name will be displayed in the account section and in reviews",
					className: field,
					validation: { required: true },
				},
				{ name: "email", type: "email", label: "Email address", autoComplete: "email", className: field, validation: { required: true } },
				{ name: "current_password", type: "password", label: "Current password (leave blank to leave unchanged)", autoComplete: "current-password", className: field },
				{ name: "new_password", type: "password", label: "New password (leave blank to leave unchanged)", autoComplete: "new-password", className: field },
				{ name: "confirm_password", type: "password", label: "Confirm new password", autoComplete: "new-password", className: field },
			]}
		/>
	);
}

type AddressFormProps = {
	type: "billing" | "shipping";
	address: AddressFields;
	countries: AddressBook["countries"];
	states: AddressBook["states"];
};

export function AddressForm({ type, address, countries, states }: AddressFormProps) {
	const router = useRouter();
	const methods = useForm<AddressInput>({ mode: "onTouched", resolver: zodResolver(addressSchema), defaultValues: { ...address } });
	const country = useWatch({ control: methods.control, name: "country" });
	const countryStates = country ? states[country] : undefined;

	const onSubmit = async (values: AddressInput) => {
		const result = await updateAddressAction(type, values);
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		toast.success(result.message);
		router.push("/my-account/edit-address/");
	};

	const fields: FormFieldConfig[] = [
		{ name: "first_name", type: "text", label: "First name", autoComplete: "given-name", className: field, validation: { required: true } },
		{ name: "last_name", type: "text", label: "Last name", autoComplete: "family-name", className: field, validation: { required: true } },
		{ name: "company", type: "text", label: "Company name (optional)", autoComplete: "organization", className: field },
		{
			name: "country",
			type: "combobox",
			label: "Country / Region",
			options: Object.entries(countries).map(([value, label]) => ({ value, label })),
			validation: { required: true },
		},
		{ name: "address_1", type: "text", label: "Street address", placeholder: "House number and street name", autoComplete: "address-line1", className: field, validation: { required: true } },
		{ name: "address_2", type: "text", placeholder: "Apartment, suite, unit, etc. (optional)", autoComplete: "address-line2", className: field },
		{ name: "city", type: "text", label: "Town / City", autoComplete: "address-level2", className: field, validation: { required: true } },
		countryStates
			? { name: "state", type: "combobox", label: "State", options: Object.entries(countryStates).map(([value, label]) => ({ value, label })) }
			: { name: "state", type: "text", label: "State / County (optional)", autoComplete: "address-level1", className: field },
		{ name: "postcode", type: "text", label: "Postcode / ZIP (optional)", autoComplete: "postal-code", className: field },
		{ name: "phone", type: "tel", label: type === "billing" ? "Phone" : "Phone (optional)", autoComplete: "tel", className: field },
		...(type === "billing" ? [{ name: "email", type: "email", label: "Email address", autoComplete: "email", className: field } as FormFieldConfig] : []),
	];

	return (
		<MainForm<AddressInput>
			methods={methods}
			requireValidToSubmit={false}
			isLoading={methods.formState.isSubmitting}
			submitLabel="Save address"
			onSubmit={onSubmit}
			rowPairs={[
				["first_name", "last_name"],
				["city", "state"],
				["postcode", "phone"],
			]}
			fields={fields}
		/>
	);
}
