import { WP_URL, decodeEntities } from "./wp";

/**
 * Server-only: sends an enquiry to WordPress (docs/wordpress/majeurs-forms.php), which keeps it under
 * wp-admin > Enquiries and emails it. Files are uploaded to the media library first (lib/api/media.ts).
 */
export type Enquiry = {
	title: string;
	fields: { label: string; value: string }[];
	replyTo: string;
	name: string;
	attachments: number[];
	page?: string;
};

export class EnquiryError extends Error {}

export async function sendEnquiry(form: string, enquiry: Enquiry): Promise<void> {
	let res: Response;
	try {
		res = await fetch(`${WP_URL}/wp-json/majeurs/v1/forms/${form}`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Majeurs-Secret": process.env.WP_ACCOUNT_SECRET ?? "" },
			body: JSON.stringify({ ...enquiry, reply_to: enquiry.replyTo }),
			cache: "no-store",
			signal: AbortSignal.timeout(15_000),
		});
	} catch {
		throw new EnquiryError("We couldn't send your message right now. Please try again, or chat with us on WhatsApp.");
	}
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		console.error("Enquiry failed", form, res.status, data?.code);
		throw new EnquiryError(
			data?.code === "rest_no_route"
				? "This form isn't connected yet. Please chat with us on WhatsApp instead."
				: decodeEntities(data?.message ?? "We couldn't send your message right now. Please try again."),
		);
	}
}
