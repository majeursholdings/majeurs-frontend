"use client";

import { EnquiryForm } from "@/components/forms/enquiryForm";
import { contactDepartments, contactSubjects } from "@/lib/forms/enquiries";
import { contactFields as f, required, toOptions } from "@/components/pages/customRequest/fields";

export function ContactForm() {
	return (
		<EnquiryForm
			form="contact"
			legalPurpose="your enquiry"
			rowPairs={[
				["first_name", "last_name"],
				["email", "phone"],
				["department", "subject"],
			]}
			fields={[
				f.firstName,
				f.lastName,
				f.email,
				{ ...f.phone, validation: undefined },
				{ name: "department", type: "select", label: "Department", placeholder: "Choose a department", options: toOptions(contactDepartments), validation: required },
				{ name: "subject", type: "select", label: "Subject", placeholder: "Choose a subject", options: toOptions(contactSubjects), validation: required },
				{ ...f.message, placeholder: "Message" },
			]}
		/>
	);
}

export default ContactForm;
