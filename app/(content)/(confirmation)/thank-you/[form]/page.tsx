import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheckBig, MoveRight } from "lucide-react";
import { whatsappLink } from "@/lib/contact";
import { enquiries, type EnquiryDefinition, type EnquiryId } from "@/lib/forms/enquiries";

/**
 * Thank-you page for enquiry forms without one of their own: /thank-you/<form>/, where "After submit" in
 * wp-admin sends people when a form is set to redirect without a path (lib/forms/success.ts). Only the
 * enquiry forms exist; anything else is a 404. Never indexed (layout) and not in wpRoutes, so not in the sitemaps.
 */
const copy: Record<EnquiryId, { heading: string; next: string }> = {
	"plan-a-visitation": { heading: "Visit requested", next: "Our showroom team will email you to confirm the date and time of your visit." },
	"custom-request": { heading: "Request received", next: "A designer will review your brief and any references you sent, then contact you to talk through the details." },
	quote: { heading: "Request received", next: "Our team will review your project details and get back to you within 24 hours." },
	"furniture-repair": { heading: "Request received", next: "Our repair team will review the details you sent, then contact you to arrange the next steps." },
	"trade-program": { heading: "Application received", next: "We'll review your application and business licence, then email you about your trade account." },
	"catalogue-request": { heading: "Request received", next: "You can download our catalogues any time from the catalogue page." },
	waitlist: { heading: "You're on the list", next: "We'll email you as soon as your piece is ready to order." },
	contact: { heading: "Message sent", next: "The right team will reply to you by email shortly." },
	complaint: { heading: "Feedback received", next: "Our customer service team will review your feedback and contact you about a resolution." },
	"job-application": { heading: "Application received", next: "Our hiring team reviews every application and will contact you if you're shortlisted." },
};

const isEnquiry = (form: string): form is EnquiryId => Object.hasOwn(enquiries, form);

export function generateStaticParams() {
	return Object.keys(enquiries).map((form) => ({ form }));
}

export async function generateMetadata({ params }: PageProps<"/thank-you/[form]">): Promise<Metadata> {
	const { form } = await params;
	return {
		title: isEnquiry(form) ? `${copy[form].heading}: ${enquiries[form].title}` : "Thank you",
		robots: { index: false, follow: false },
	};
}

/** The form is checked before anything renders, so an unknown one is a real 404 */
export default async function Page({ params }: PageProps<"/thank-you/[form]">) {
	const { form } = await params;
	if (!isEnquiry(form)) notFound();
	const definition: EnquiryDefinition = enquiries[form];
	const { heading, next } = copy[form];

	return (
		<div className="space-y-5">
			<CircleCheckBig className="mx-auto size-14 text-black" strokeWidth={1.25} aria-hidden />
			<p className="eyebrow">{definition.title}</p>
			<h1 className="text-h2 font-normal text-black">{heading}</h1>
			<p className="text-sm text-charcoal md:text-base">{definition.successMessage}</p>
			<p className="text-sm text-charcoal md:text-base">{next}</p>
			<a
				href={whatsappLink(`Hello Majeurs, I just sent the "${definition.title}" form on your website.`)}
				target="_blank"
				rel="noopener noreferrer"
				className="group inline-flex items-center gap-2 text-xs text-black hover:text-gold"
			>
				Questions in the meantime? Chat with us on WhatsApp
				<MoveRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
			</a>
		</div>
	);
}
