"use client";

import { EnquiryForm } from "@/components/forms/enquiryForm";
import { contactFields as f, required } from "@/components/pages/customRequest/fields";

/** The Academy waitlist (ex-Elementor "Academy Registration Waitlist"): saved under wp-admin → Enquiries → Academy registration waitlist */
export function AcademyWaitlistForm({ submitLabel }: { submitLabel: string }) {
	return (
		<EnquiryForm
			form="academy-waitlist"
			legalPurpose="your waitlist place"
			submitLabel={submitLabel}
			rowPairs={[
				["first_name", "last_name"],
				["email", "phone"],
			]}
			fields={[f.firstName, { ...f.lastName, validation: required }, f.email, f.phone]}
		/>
	);
}
