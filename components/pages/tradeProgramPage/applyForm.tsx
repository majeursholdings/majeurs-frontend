"use client";

import { EnquiryForm, referenceUploadField } from "@/components/forms/enquiryForm";
import { professionalRoles, tradeProjectTypes } from "@/lib/forms/enquiries";

const options = (list: readonly string[]) => list.map((value) => ({ value, label: value }));

/** "Apply for trade access": the ex-Elementor registration form, sent through submitEnquiryAction */
export function TradeApplyForm() {
	return (
		<EnquiryForm
			form="trade-program"
			submitLabel="Register now"
			rowPairs={[
				["first_name", "last_name"],
				["work_email", "phone"],
				["company", "location"],
			]}
			fields={[
				{ name: "first_name", type: "text", label: "First name", placeholder: "John", autoComplete: "given-name", validation: { required: true } },
				{ name: "last_name", type: "text", label: "Last name", placeholder: "Doe", autoComplete: "family-name" },
				{ name: "work_email", type: "email", label: "Work email", placeholder: "name@company.com", autoComplete: "email", validation: { required: true } },
				{ name: "phone", type: "tel", label: "Phone number", placeholder: "2349012345678", autoComplete: "tel", validation: { required: true } },
				{ name: "company", type: "text", label: "Company name", placeholder: "Sample PLC", autoComplete: "organization", validation: { required: true } },
				{ name: "location", type: "text", label: "Location (city, country)", placeholder: "Example (Lagos, Nigeria)", validation: { required: true } },
				{ name: "industry", type: "select", label: "Business industry", placeholder: "Choose your industry", options: options(professionalRoles), validation: { required: true } },
				{ name: "project_types", type: "multiselect", label: "Project type", placeholder: "Choose all that apply", options: options(tradeProjectTypes) },
				referenceUploadField("licence", "Upload your business licence (image or PDF)", true),
				{ name: "heard_about", type: "text", label: "How did you hear about Majeurs?", placeholder: "Instagram, a colleague, a project…", validation: { required: true } },
			]}
			legalPurpose="your request"
		/>
	);
}
