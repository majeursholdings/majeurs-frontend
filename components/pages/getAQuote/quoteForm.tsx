"use client";

import { EnquiryForm, referenceUploadField } from "@/components/forms/enquiryForm";
import {
	professionalRoles,
	quoteBudgets,
	quoteDecisionMaker,
	quoteDelivery,
	quoteNeeds,
	quoteProjectFor,
	quoteScope,
	quoteStages,
	quoteTimelines,
} from "@/lib/forms/enquiries";
import { contactFields as f, required, toOptions } from "@/components/pages/customRequest/fields";

const select = (name: string, label: string, options: readonly string[]) =>
	({ name, type: "select", label, placeholder: "Choose an option", options: toOptions(options), validation: required }) as const;

/** Goes to /get-a-quote-…/quote-request-received/ after sending: the "quote" form's "After submit" default in wp-admin (and successPath fallback) */
export function QuoteForm() {
	return (
		<EnquiryForm
			form="quote"
			submitLabel="Request your design consultation"
			legalPurpose="your request"
			rowPairs={[
				["first_name", "last_name"],
				["business_name", "email"],
				["phone", "location"],
				["role", "project_for"],
				["need", "scope"],
				["delivery", "budget"],
				["timeline", "stage"],
			]}
			fields={[
				f.firstName,
				f.lastName,
				{ name: "business_name", type: "text", label: "Business name", placeholder: "Sample PLC", autoComplete: "organization", validation: required },
				f.email,
				f.phone,
				f.location,
				select("role", "Professional role", professionalRoles),
				select("project_for", "Who is this project for", quoteProjectFor),
				select("need", "What do you need?", quoteNeeds),
				select("scope", "How much are you furnishing?", quoteScope),
				select("delivery", "Where will this be delivered?", quoteDelivery),
				select("budget", "What investment range have you set aside?", quoteBudgets),
				select("timeline", "When do you need the furniture in place?", quoteTimelines),
				select("stage", "Where are you in the process?", quoteStages),
				select("decision_maker", "Are you the decision-maker on this project?", quoteDecisionMaker),
				f.message,
				referenceUploadField(),
			]}
		/>
	);
}

export default QuoteForm;
