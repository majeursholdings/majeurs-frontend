import type { Metadata } from "next";
import ComplaintPage from "@/components/pages/complaintPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/customer-complaint-and-feedback-form/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "Tell Majeurs Holdings about a problem with a product or service, or share a suggestion or compliment. Our customer service team reviews every submission.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<ComplaintPage />
		</>
	);
}
