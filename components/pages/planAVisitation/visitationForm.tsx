"use client";

import dayjs from "dayjs";
import { EnquiryForm } from "@/components/forms/enquiryForm";
import { visitationReasons } from "@/lib/forms/enquiries";
import { contactFields as f, required, toOptions } from "@/components/pages/customRequest/fields";

/** Half-hour visiting slots, 11:00–15:00 (MainForm has no time-only field) */
const timeSlots = Array.from({ length: 9 }, (_, i) => {
	const minutes = 11 * 60 + i * 30;
	const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
	return { label: time, value: time };
});

export function VisitationForm() {
	return (
		<EnquiryForm
			form="plan-a-visitation"
			legalPurpose="your visitation"
			rowPairs={[
				["first_name", "last_name"],
				["email", "phone"],
				["date", "time"],
			]}
			fields={[
				f.firstName,
				f.lastName,
				f.email,
				{ ...f.phone, validation: undefined },
				{ name: "reason", type: "select", label: "Reason", placeholder: "Choose a reason", options: toOptions(visitationReasons), validation: required },
				// checked when the calendar opens, so "today" is never baked into a prerender
				{ name: "date", type: "date", label: "Pick a date", isDateDisabled: (date) => dayjs(date).isBefore(dayjs(), "day"), validation: required },
				{ name: "time", type: "select", label: "Pick a time", placeholder: "Choose a time", options: timeSlots, validation: required },
				{ ...f.message, placeholder: "Message" },
			]}
		/>
	);
}

export default VisitationForm;
