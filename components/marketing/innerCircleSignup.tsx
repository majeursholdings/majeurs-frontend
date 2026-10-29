"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import { newsletterSchema, subscribeToNewsletter, type NewsletterInput } from "@/lib/api/newsletter";
import { getErrorMessage } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

const field = "h-12 bg-white px-4 text-black";

/** "Join the Inner Circle" newsletter block (WP shop/archive pages), on MainForm with the zod schema. */
export function InnerCircleSignup() {
	const methods = useForm<NewsletterInput>({ mode: "onTouched", resolver: zodResolver(newsletterSchema), defaultValues: { firstName: "", lastName: "", email: "", phone: "" } });

	const onSubmit = async (values: NewsletterInput) => {
		try {
			await subscribeToNewsletter(values);
			trackEvent({ event: "form_submit", form_name: "newsletter" });
			toast.success("You're in. Look out for our next drop.");
			methods.reset();
		} catch (error) {
			toast.error(getErrorMessage(error));
		}
	};

	return (
		<section className="px-2.5 pb-16 pt-6 md:pb-24">
			<div className="mx-auto max-w-2xl text-center">
				<p className="text-xs uppercase tracking-eyebrow text-black">Be the first to know</p>
				<h2 className="mt-3 font-display text-[1.75rem] leading-tight md:text-[2rem]">
					Join the Inner Circle to be the first to grab our new and rarest collection
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-sm text-charcoal">
					We offer premium first-look opportunities to our inner circle members for our latest products and services. Just
					tell us where to send it when they drop!
				</p>

				<MainForm<NewsletterInput>
					methods={methods}
					trackingName="newsletter"
					className="mx-auto mt-8 max-w-md gap-3 text-left"
					fieldGapClassName="gap-3"
					requireValidToSubmit={false}
					isLoading={methods.formState.isSubmitting}
					submitLabel="Sign up"
					onSubmit={onSubmit}
					rowPairs={[["firstName", "lastName"]]}
					fields={[
						{ name: "firstName", type: "text", placeholder: "First Name", autoComplete: "given-name", className: field },
						{ name: "lastName", type: "text", placeholder: "Last Name", autoComplete: "family-name", className: field },
						{ name: "email", type: "email", placeholder: "Enter Email Address", autoComplete: "email", className: field },
						{ name: "phone", type: "tel", placeholder: "Phone number (optional)", autoComplete: "tel", className: field },
					]}
				/>
			</div>
		</section>
	);
}

export default InnerCircleSignup;
