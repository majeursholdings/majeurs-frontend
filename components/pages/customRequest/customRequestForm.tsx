"use client";

import { EnquiryForm, referenceUploadField } from "@/components/forms/enquiryForm";
import { customBudgets, customProjectTypes, urgencyOptions } from "@/lib/forms/enquiries";
import { contactFields as f, required, toOptions } from "./fields";

export function CustomRequestForm() {
	return (
		<EnquiryForm
			form="custom-request"
			legalPurpose="your request"
			rowPairs={[
				["first_name", "last_name"],
				["email", "phone"],
				["location", "project_type"],
				["budget", "urgency"],
			]}
			fields={[
				f.firstName,
				f.lastName,
				f.email,
				f.phone,
				f.location,
				{ name: "project_type", type: "select", label: "Project type", placeholder: "Choose a project type", options: toOptions(customProjectTypes), validation: required },
				{ name: "budget", type: "select", label: "Estimated budget", placeholder: "Choose a budget", options: toOptions(customBudgets), validation: required },
				{ name: "urgency", type: "select", label: "How soon do you need this?", placeholder: "Choose a timeline", options: toOptions(urgencyOptions), validation: required },
				f.furnitureType,
				f.message,
				referenceUploadField(),
			]}
		/>
	);
}

export default CustomRequestForm;
