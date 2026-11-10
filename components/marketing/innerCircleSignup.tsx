"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import MainForm from "@/components/customForm";
import { toFormData } from "@/components/customForm/formData";
import { useRecaptcha } from "@/components/common/recaptchaChallenge";
import { useEnquirySuccess } from "@/components/forms/useEnquirySuccess";
import { enquiries, type EnquiryValues } from "@/lib/forms/enquiries";
import { submitEnquiryAction } from "@/lib/forms/submit";
import { enquiryAction } from "@/lib/recaptcha/client";

type NewsletterInput = EnquiryValues<"newsletter">;

const field = "h-12 bg-white px-4 text-black";

/**
 * "Join the Inner Circle" newsletter block (WP shop/archive pages). A sign-up is an enquiry like the other forms
 * (wp-admin > Enquiries > Newsletter sign-up), and signing up is the consent to marketing emails, so it subscribes
 * the person in Mailchimp.
 */
export function InnerCircleSignup() {
	const methods = useForm<NewsletterInput>({
		mode: "onTouched",
		resolver: zodResolver(enquiries.newsletter.schema) as unknown as Resolver<NewsletterInput>,
		defaultValues: { first_name: "", last_name: "", email: "", phone: "" },
	});
	const recaptcha = useRecaptcha(enquiryAction("newsletter"));
	const success = useEnquirySuccess("newsletter");

	const onSubmit = async (values: NewsletterInput) => {
		const result = await recaptcha.send((proof) => submitEnquiryAction("newsletter", toFormData({ ...values, marketing_opt_in: true }), proof));
		if (!result.ok) {
			toast.error(result.message);
			return;
		}
		success.done(result, () => methods.reset());
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
					rowPairs={[["first_name", "last_name"]]}
					fields={[
						{ name: "first_name", type: "text", placeholder: "First Name", autoComplete: "given-name", className: field },
						{ name: "last_name", type: "text", placeholder: "Last Name", autoComplete: "family-name", className: field },
						{ name: "email", type: "email", placeholder: "Enter Email Address", autoComplete: "email", className: field },
						{ name: "phone", type: "tel", placeholder: "Phone number (optional)", autoComplete: "tel", className: field },
					]}
				/>
				{recaptcha.checkbox}
				{success.dialog}
			</div>
		</section>
	);
}

export default InnerCircleSignup;
