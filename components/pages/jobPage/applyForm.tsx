"use client";

import { EnquiryForm } from "@/components/forms/enquiryForm";
import { API_DOCUMENT_ACCEPT } from "@/components/customForm/fileRules";
import { ENQUIRY_MAX_FILES, ENQUIRY_MAX_FILE_MB } from "@/lib/forms/enquiries";

const required = { required: true };

/** The job application ("job-application" enquiry): CV as a PDF, optional previous results as PDF/JPG/PNG */
export function ApplyForm({ role }: { role: string }) {
	return (
		<EnquiryForm
			form="job-application"
			legalPurpose="your application"
			submitLabel="Submit application"
			defaultValues={{ role }}
			rowPairs={[
				["first_name", "last_name"],
				["email", "phone"],
				["role", "portfolio"],
			]}
			fields={[
				{ name: "first_name", type: "text", label: "First name", placeholder: "John", autoComplete: "given-name", validation: required },
				{ name: "last_name", type: "text", label: "Last name", placeholder: "Doe", autoComplete: "family-name" },
				{ name: "email", type: "email", label: "Email", placeholder: "name@email.com", autoComplete: "email", validation: required },
				{ name: "phone", type: "tel", label: "Phone number", placeholder: "2349012345678", autoComplete: "tel", validation: required },
				{ name: "role", type: "text", label: "What role are you applying for?", placeholder: "Role you are applying for", validation: required },
				{ name: "portfolio", type: "text", label: "Portfolio link", placeholder: "https://domain.com/", inputMode: "url", autoComplete: "url" },
				{
					name: "resume",
					type: "file",
					label: "Upload resume (PDF)",
					accept: API_DOCUMENT_ACCEPT,
					maxFiles: 1,
					maxSizeMB: ENQUIRY_MAX_FILE_MB,
					description: `PDF only, up to ${ENQUIRY_MAX_FILE_MB}MB.`,
					validation: { required: "Please attach your resume" },
				},
				{
					name: "previous_results",
					type: "file",
					label: "Previous results for required roles",
					acceptImages: true,
					accept: `.jpg, .jpeg, .png, image/jpeg, image/png, ${API_DOCUMENT_ACCEPT}`,
					multiple: true,
					maxFiles: ENQUIRY_MAX_FILES,
					maxSizeMB: ENQUIRY_MAX_FILE_MB,
					description: `PDF, JPG or PNG, up to ${ENQUIRY_MAX_FILES} files of ${ENQUIRY_MAX_FILE_MB}MB each.`,
				},
				{ name: "cover_letter", type: "textarea", label: "Cover letter", placeholder: "Write your cover letter here", rows: 7, validation: required },
				{ name: "additional_information", type: "textarea", label: "Additional information", placeholder: "Additional information", rows: 3 },
			]}
		/>
	);
}

export default ApplyForm;
