"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEAD_FORMS, SUCCESS_EVENTS, trackEvent } from "@/lib/analytics";
import { enquiries, type EnquiryId } from "@/lib/forms/enquiries";
import { safeRedirect, thankYouPath, type EnquirySuccess } from "@/lib/forms/success";
import { SuccessDialog } from "./successDialog";

/**
 * After an enquiry form is sent (WordPress accepted it): track form_submit, plus generate_lead for sales forms
 * (LEAD_FORMS), reset the form, then do what the form's "After submit"
 * setting says (submitEnquiryAction resolves it): show the "Thank you" pop-up, or go to the thank-you page.
 * Render `dialog` anywhere in the form.
 *
 *   const success = useEnquirySuccess("contact");
 *   if (result.ok) success.done(result, () => methods.reset());
 *   {success.dialog}
 */
export function useEnquirySuccess(form: EnquiryId, options: { title?: string; finalFocus?: React.RefObject<HTMLElement | null> } = {}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	// kept after closing, so the text doesn't vanish while the pop-up fades out
	const [message, setMessage] = useState("");

	// only called once submitEnquiryAction has returned ok, so generate_lead counts enquiries WordPress received
	const track = () => {
		const formName = enquiries[form].trackingName;
		trackEvent({ event: "form_submit", form_name: formName });
		if (LEAD_FORMS.has(formName)) trackEvent({ event: "generate_lead", form_name: formName });
		const successEvent = SUCCESS_EVENTS[formName];
		if (successEvent) trackEvent({ event: successEvent, form_name: formName });
	};

	const done = (result: EnquirySuccess, reset: () => void) => {
		track();
		reset();
		if (result.mode === "redirect") {
			// checked again here: never navigate to another site, whatever the server sent
			router.push(safeRedirect(result.redirect) ?? thankYouPath(form));
			return;
		}
		setMessage(result.message);
		setOpen(true);
	};

	const dialog = <SuccessDialog open={open} onOpenChange={setOpen} message={message} title={options.title} finalFocus={options.finalFocus} />;
	return { done, track, dialog };
}
