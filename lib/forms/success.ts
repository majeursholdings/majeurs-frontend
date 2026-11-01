// What a form does after a successful submit. Shared by submitEnquiryAction (server) and useEnquirySuccess
// (client), so keep it free of server imports.
import { enquiries, type EnquiryDefinition, type EnquiryId } from "./enquiries";

/** wp-admin > Enquiries > <form> > "After submit": show a message, or go to a thank-you page */
export type EnquirySuccess = { mode: "message" | "redirect"; message: string; redirect?: string };

/**
 * A site-relative path WordPress may send people to: "/…", never "//host" or "/\host" (browsers read "\" as "/"),
 * no spaces. Anything else is ignored, so WP data can never navigate to another site.
 */
const SAFE_PATH = /^\/(?![/\\])[^\s\\]*$/;

export function safeRedirect(path: unknown): string | undefined {
	return typeof path === "string" && SAFE_PATH.test(path) ? path : undefined;
}

/** The generic thank-you page (app/(content)/(confirmation)/thank-you/[form]) for forms without their own */
export const thankYouPath = (form: EnquiryId) => `/thank-you/${form}/`;

/**
 * WordPress's "After submit" setting for the form, with this site's definition as the fallback:
 * an older snippet that sends no `success` keeps successPath / successMessage (lib/forms/enquiries.ts),
 * an empty message keeps successMessage, and a redirect with no usable path goes to /thank-you/<form>/.
 */
export function enquirySuccess(form: EnquiryId, wp?: { mode?: unknown; message?: unknown; redirect?: unknown } | null): EnquirySuccess {
	const definition: EnquiryDefinition = enquiries[form];
	const message = (typeof wp?.message === "string" && wp.message.trim()) || definition.successMessage;
	if (wp?.mode === "redirect") return { mode: "redirect", message, redirect: safeRedirect(wp.redirect) ?? thankYouPath(form) };
	if (wp?.mode === "message") return { mode: "message", message };
	return definition.successPath ? { mode: "redirect", message, redirect: definition.successPath } : { mode: "message", message };
}
