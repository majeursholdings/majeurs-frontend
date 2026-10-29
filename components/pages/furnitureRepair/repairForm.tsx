"use client";

import { EnquiryForm, referenceUploadField } from "@/components/forms/enquiryForm";
import { repairProjectTypes, urgencyOptions } from "@/lib/forms/enquiries";
import { contactFields as f, required, toOptions } from "@/components/pages/customRequest/fields";

export function RepairForm() {
	return (
		<EnquiryForm
			form="furniture-repair"
			legalPurpose="your request"
			rowPairs={[
				["first_name", "last_name"],
				["email", "phone"],
				["location", "furniture_type"],
				["project_type", "urgency"],
			]}
			fields={[
				f.firstName,
				f.lastName,
				f.email,
				f.phone,
				f.location,
				f.furnitureType,
				{ name: "project_type", type: "select", label: "Project type", placeholder: "Choose a project type", options: toOptions(repairProjectTypes), validation: required },
				{ name: "urgency", type: "select", label: "How soon do you need this?", placeholder: "Choose a timeline", options: toOptions(urgencyOptions), validation: required },
				f.message,
				referenceUploadField(),
			]}
		/>
	);
}

export default RepairForm;
