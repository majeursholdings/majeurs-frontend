import { z } from "zod";

export const newsletterSchema = z.object({
	firstName: z.string().trim().min(1, "Please enter your first name"),
	lastName: z.string().trim().min(1, "Please enter your last name"),
	email: z.string().trim().email("Please enter a valid email address"),
	phone: z
		.string()
		.trim()
		.regex(/^\+?[0-9\s-]{7,20}$/, "Please enter a valid phone number")
		.optional()
		.or(z.literal("")),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/**
 * TODO: connect to the same destination as the WP Elementor form (Mailchimp audience) through a
 * server route (app/api/newsletter/route.ts) using the axios client. Add bot protection before going
 * live: useRecaptcha("newsletter") on the client, checkRecaptcha on the server (lib/recaptcha/).
 */
export async function subscribeToNewsletter(input: NewsletterInput): Promise<void> {
	void input;
	throw new Error("Newsletter signup isn't connected yet.");
}
