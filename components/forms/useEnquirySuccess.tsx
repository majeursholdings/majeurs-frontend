"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { enquiries, type EnquiryId } from "@/lib/forms/enquiries";
import { safeRedirect, thankYouPath, type EnquirySuccess } from "@/lib/forms/success";
import { SuccessDialog } from "./successDialog";

/**
 * After an enquiry form is sent: track form_submit, reset the form, then do what the form's "After submit"
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

	const track = () => trackEvent({ event: "form_submit", form_name: enquiries[form].trackingName });

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
