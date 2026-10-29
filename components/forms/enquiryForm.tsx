"use client";

import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import { toFormData } from "@/components/customForm/formData";
import { API_DOCUMENT_ACCEPT, API_PHOTO_ACCEPT } from "@/components/customForm/fileRules";
import type { FormFieldConfig } from "@/components/customForm/types";
import { LegalNote } from "@/components/landing/legalNote";
import { trackEvent } from "@/lib/analytics";
import { ENQUIRY_MAX_FILES, ENQUIRY_MAX_FILE_MB, enquiries, type EnquiryDefinition, type EnquiryId } from "@/lib/forms/enquiries";
import { submitEnquiryAction } from "@/lib/forms/submit";

type EnquiryFormProps = {
	form: EnquiryId;
	fields: FormFieldConfig[];
	rowPairs?: [string, string][];
	submitLabel?: string;
	/** "your visitation", "your request" … in the legal line under the form */
	legalPurpose?: string;
	/** Pre-filled answers, e.g. the piece someone clicked "Join waitlist" from */
	defaultValues?: FieldValues;
	className?: string;
};

/**
 * Any ex-Elementor enquiry form: MainForm + the form's zod schema (lib/forms/enquiries.ts), a honeypot,
 * and submitEnquiryAction. Shows a toast, then goes to the form's thank-you page if it has one.
 */
export function EnquiryForm({ form, fields, rowPairs, submitLabel = "Send", legalPurpose, defaultValues, className }: EnquiryFormProps) {
	const router = useRouter();
	const definition: EnquiryDefinition = enquiries[form];
	// one component for every schema: the field configs are typed loosely, the schema still validates.
	// raw: hand onSubmit the values as entered, so file fields (not in the schemas) reach toFormData
	const methods = useForm<FieldValues>({ mode: "onTouched", resolver: zodResolver(definition.schema, undefined, { raw: true }) as unknown as Resolver<FieldValues>, defaultValues });

	const onSubmit = async (values: FieldValues) => {
		const result = await submitEnquiryAction(form, toFormData(localDates(values)));
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		trackEvent({ event: "form_submit", form_name: definition.trackingName });
		toast.success(result.message);
		methods.reset(defaultValues);
		if (result.redirect) router.push(result.redirect);
	};

	return (
		<div className={className}>
			<MainForm
				methods={methods}
				trackingName={definition.trackingName}
				requireValidToSubmit={false}
				isLoading={methods.formState.isSubmitting}
				submitLabel={submitLabel}
				onSubmit={onSubmit}
				rowPairs={rowPairs}
				fields={fields}
				footerSlot={
					// honeypot: off-screen, skipped by keyboard and autofill
					<input {...methods.register("website")} type="text" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] size-px opacity-0" />
				}
			/>
			<div className="mt-8">
				<LegalNote purpose={legalPurpose} />
			</div>
		</div>
	);
}

/**
 * MainForm's date picker stores local midnight as an ISO string ("2026-11-03T23:00:00.000Z" in Lagos),
 * which reads as the previous day anywhere in UTC. Send the calendar day the visitor picked: "2026-11-04".
 * (No enquiry form uses a datetime field; one would need its time kept.)
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function localDates(values: FieldValues): FieldValues {
	return Object.fromEntries(
		Object.entries(values).map(([key, value]) => [key, typeof value === "string" && ISO_DATE.test(value) ? dayjs(value).format("YYYY-MM-DD") : value]),
	);
}

/** The "Additional document for references…" upload field: photos or PDF, up to 4 files of 5MB */
export function referenceUploadField(name = "files", label = "Additional document for references and more details (image or PDF)", required = false): FormFieldConfig {
	return {
		name,
		type: "file",
		label,
		acceptImages: true,
		accept: `${API_PHOTO_ACCEPT}, ${API_DOCUMENT_ACCEPT}`,
		multiple: !required,
		maxFiles: required ? 1 : ENQUIRY_MAX_FILES,
		maxSizeMB: ENQUIRY_MAX_FILE_MB,
		description: required ? `Image or PDF, up to ${ENQUIRY_MAX_FILE_MB}MB.` : `Images or PDF, up to ${ENQUIRY_MAX_FILES} files of ${ENQUIRY_MAX_FILE_MB}MB each.`,
		validation: required ? { required: "Please attach your document" } : undefined,
	};
}
