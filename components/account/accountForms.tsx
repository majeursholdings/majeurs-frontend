"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import type { FormFieldConfig } from "@/components/customForm/types";
import { changePasswordAction, updateAddressAction, updateProfileAction } from "@/app/(commerce)/my-account/actions";
import {
	addressSchema,
	changePasswordSchema,
	profileSchema,
	type AddressInput,
	type ChangePasswordInput,
	type ProfileInput,
} from "@/lib/account/schemas";
import type { AddressBook, AddressFields, Customer } from "@/lib/api/account";

/** Account details > Profile: first and last name (email and display name are shown read-only beside it) */
export function ProfileForm({ customer }: { customer: Customer }) {
	const methods = useForm<ProfileInput>({
		mode: "onTouched",
		resolver: zodResolver(profileSchema),
		defaultValues: { first_name: customer.first_name, last_name: customer.last_name },
	});

	const onSubmit = async (values: ProfileInput) => {
		const result = await updateProfileAction(values);
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		toast.success(result.message);
		methods.reset(values);
	};

	return (
		<MainForm<ProfileInput>
			methods={methods}
			requireValidToSubmit={false}
			isLoading={methods.formState.isSubmitting}
			submitLabel="Save name"
			onSubmit={onSubmit}
			rowPairs={[["first_name", "last_name"]]}
			fields={[
				{ name: "first_name", type: "text", label: "First name", autoComplete: "given-name", validation: { required: true } },
				{ name: "last_name", type: "text", label: "Last name", autoComplete: "family-name", validation: { required: true } },
			]}
		/>
	);
}

/** Account details > Password: saved on its own, so a name change never needs the password */
export function ChangePasswordForm({ email }: { email: string }) {
	const methods = useForm<ChangePasswordInput>({
		mode: "onTouched",
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { current_password: "", new_password: "", confirm_password: "" },
	});

	const onSubmit = async (values: ChangePasswordInput) => {
		const result = await changePasswordAction(values);
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		toast.success(result.message);
		methods.reset();
	};

	return (
		<MainForm<ChangePasswordInput>
			methods={methods}
			requireValidToSubmit={false}
			isLoading={methods.formState.isSubmitting}
			submitLabel="Change password"
			onSubmit={onSubmit}
			fields={[
				{ name: "current_password", type: "password", label: "Current password", autoComplete: "current-password", validation: { required: true } },
				{
					name: "new_password",
					type: "password",
					label: "New password",
					description: "At least 8 characters.",
					autoComplete: "new-password",
					validation: { required: true },
				},
				{ name: "confirm_password", type: "password", label: "Confirm new password", autoComplete: "new-password", validation: { required: true } },
			]}
			footerSlot={
				// tells password managers which account this password belongs to
				<input type="text" name="username" autoComplete="username" value={email} readOnly tabIndex={-1} aria-hidden className="sr-only" />
			}
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
		{ name: "first_name", type: "text", label: "First name", autoComplete: "given-name", validation: { required: true } },
		{ name: "last_name", type: "text", label: "Last name", autoComplete: "family-name", validation: { required: true } },
		{ name: "company", type: "text", label: "Company name (optional)", autoComplete: "organization" },
		{
			name: "country",
			type: "combobox",
			label: "Country / Region",
			options: Object.entries(countries).map(([value, label]) => ({ value, label })),
			validation: { required: true },
		},
		{ name: "address_1", type: "text", label: "Street address", placeholder: "House number and street name", autoComplete: "address-line1", validation: { required: true } },
		{ name: "address_2", type: "text", placeholder: "Apartment, suite, unit, etc. (optional)", autoComplete: "address-line2" },
		{ name: "city", type: "text", label: "Town / City", autoComplete: "address-level2", validation: { required: true } },
		countryStates
			? { name: "state", type: "combobox", label: "State", options: Object.entries(countryStates).map(([value, label]) => ({ value, label })) }
			: { name: "state", type: "text", label: "State / County (optional)", autoComplete: "address-level1" },
		{ name: "postcode", type: "text", label: "Postcode / ZIP (optional)", autoComplete: "postal-code" },
		{ name: "phone", type: "tel", label: type === "billing" ? "Phone" : "Phone (optional)", autoComplete: "tel" },
		...(type === "billing" ? [{ name: "email", type: "email", label: "Email address", autoComplete: "email" } as FormFieldConfig] : []),
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
