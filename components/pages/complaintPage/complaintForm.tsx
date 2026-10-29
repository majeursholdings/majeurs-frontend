"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import { toFormData } from "@/components/customForm/formData";
import type { FormFieldConfig } from "@/components/customForm/types";
import { LegalNote } from "@/components/landing/legalNote";
import { contactFields as f, required, toOptions } from "@/components/pages/customRequest/fields";
import { trackEvent } from "@/lib/analytics";
import { enquiries, feedbackTypes, serviceRatings } from "@/lib/forms/enquiries";
import { submitEnquiryAction } from "@/lib/forms/submit";
import { cn } from "@/lib/utils";

const rating = (name: string, label: string): FormFieldConfig => ({
	name,
	type: "select",
	label,
	placeholder: "Choose a rating",
	options: toOptions(serviceRatings),
	validation: required,
});

/** Sections A–F of the WP form, each validated before moving on */
const steps: { title: string; fields: FormFieldConfig[]; rowPairs?: [string, string][] }[] = [
	{
		title: "Customer Information",
		rowPairs: [
			["first_name", "last_name"],
			["company_name", "phone"],
		],
		fields: [
			f.firstName,
			f.lastName,
			{ name: "company_name", type: "text", label: "Company name (optional)", placeholder: "Company LLC", autoComplete: "organization" },
			f.phone,
			f.email,
			{ name: "address", type: "textarea", label: "Address", placeholder: "123 Street, Winners Drive, Lagos, Nigeria", rows: 3, autoComplete: "street-address" },
		],
	},
	{
		title: "Product or Service Details",
		rowPairs: [
			["product_name", "invoice_number"],
			["purchase_date", "delivery_location"],
		],
		fields: [
			{ name: "product_name", type: "text", label: "Product name", validation: required },
			{ name: "invoice_number", type: "text", label: "Order / invoice number", validation: required },
			// checked when the calendar opens, so "today" is never baked into a prerender
			{ name: "purchase_date", type: "date", label: "Date of purchase / service", isDateDisabled: (date) => dayjs(date).isAfter(dayjs(), "day"), validation: required },
			{ name: "delivery_location", type: "text", label: "Delivery location", placeholder: "Lagos, Nigeria", validation: required },
		],
	},
	{
		title: "Type of Feedback",
		fields: [{ name: "feedback_type", type: "select", label: "Type of feedback", placeholder: "Choose a type", options: toOptions(feedbackTypes), validation: required }],
	},
	{
		title: "Description",
		fields: [{ name: "description", type: "textarea", label: "Feedback description", placeholder: "Tell us what happened", rows: 6, validation: required }],
	},
	{
		title: "Service Rating",
		rowPairs: [
			["rating_product", "rating_packaging"],
			["rating_delivery", "rating_service"],
		],
		fields: [
			rating("rating_product", "Product"),
			rating("rating_packaging", "Packaging"),
			rating("rating_delivery", "Delivery times"),
			rating("rating_service", "Customer service"),
		],
	},
	{
		title: "Expected Resolution",
		fields: [{ name: "expected_resolution", type: "textarea", label: "Expected resolution", placeholder: "How would you like us to resolve this?", rows: 6, validation: required }],
	},
];

const LETTERS = "ABCDEF";

/**
 * Keep focus in the field on mouse down: blurring a field that shows an error clears the message, the
 * button jumps up under the cursor, and the click never lands. Keyboard use is unaffected.
 */
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

/** MainForm stores dates as ISO (local midnight); send the calendar day picked, as EnquiryForm does */
const toDay = (value: unknown) => (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) ? dayjs(value).format("YYYY-MM-DD") : value);

/**
 * The WP six-step complaint form: one react-hook-form instance across the steps (values survive Back/Next),
 * each step's fields validated before moving on, then submitEnquiryAction("complaint").
 */
export function ComplaintForm() {
	const [step, setStep] = useState(0);
	const methods = useForm<FieldValues>({
		mode: "onTouched",
		// raw: send the values as entered; the action validates them again on the server
		resolver: zodResolver(enquiries.complaint.schema, undefined, { raw: true }) as unknown as Resolver<FieldValues>,
	});
	const last = step === steps.length - 1;
	const current = steps[step];

	const next = async () => {
		const ok = await methods.trigger(current.fields.map((field) => field.name));
		if (ok) setStep((s) => Math.min(s + 1, steps.length - 1));
	};

	const onSubmit = async (values: FieldValues) => {
		const data = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, toDay(value)]));
		const result = await submitEnquiryAction("complaint", toFormData(data));
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		trackEvent({ event: "form_submit", form_name: "complaint" });
		toast.success(result.message);
		methods.reset();
		setStep(0);
	};

	return (
		<div className="space-y-10">
			<ol className="grid grid-cols-6 gap-1" aria-label="Form sections">
				{steps.map((s, i) => (
					<li key={s.title} className="relative flex flex-col items-center gap-2 text-center">
						{i ? <span className={cn("absolute right-1/2 top-3.5 h-px w-full -translate-x-4", i <= step ? "bg-black" : "bg-sand")} aria-hidden /> : null}
						<span
							aria-current={i === step ? "step" : undefined}
							className={cn(
								"relative flex size-7 items-center justify-center border bg-white text-xs",
								i === step ? "border-gold text-gold" : i < step ? "border-black bg-black text-white" : "border-grey text-charcoal",
							)}
						>
							{i + 1}
						</span>
						<span className={cn("hidden text-[11px] leading-tight sm:block", i === step ? "text-gold" : "text-charcoal")}>
							Section {LETTERS[i]}: {s.title}
						</span>
					</li>
				))}
			</ol>

			<div className="space-y-6">
				<h2 className="text-sm uppercase tracking-button text-black">
					<span className="sr-only">Step {step + 1} of {steps.length}: </span>
					Section {LETTERS[step]}: {current.title}
				</h2>
				<MainForm
					// remount per step so each step's fields register cleanly; values live in `methods`
					key={step}
					methods={methods}
					trackingName="complaint"
					requireValidToSubmit={false}
					isLoading={methods.formState.isSubmitting}
					onSubmit={async (values) => {
						// Enter on an earlier step moves on instead of submitting
						if (!last) return next();
						await onSubmit(values);
					}}
					rowPairs={current.rowPairs}
					fields={current.fields}
					footerSlot={
						// honeypot: off-screen, skipped by keyboard and autofill
						<input {...methods.register("website")} type="text" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />
					}
					renderFooter={({ isLoading }) => (
						<div className="flex gap-3">
							{step > 0 ? (
								<button type="button" onMouseDown={keepFocus} onClick={() => setStep((s) => s - 1)} className="btn flex-1 border-black text-black hover:bg-black hover:text-white">
									Back
								</button>
							) : null}
							{last ? (
								<button type="submit" disabled={isLoading} onMouseDown={keepFocus} className="btn flex-[2] border-black bg-black text-white hover:border-gold hover:bg-gold">
									{isLoading ? "Sending…" : "Submit"}
								</button>
							) : (
								<button type="button" onMouseDown={keepFocus} onClick={next} className="btn flex-[2] border-black bg-black text-white hover:border-gold hover:bg-gold">
									Next
								</button>
							)}
						</div>
					)}
				/>
			</div>

			<LegalNote />
		</div>
	);
}

export default ComplaintForm;
