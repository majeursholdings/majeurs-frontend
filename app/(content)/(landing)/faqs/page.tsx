import type { Metadata } from "next";
import FaqsPage from "@/components/pages/faqsPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/faqs/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description:
			"Answers on ordering, shipping and delivery, the 12-month warranty, custom projects, refunds, payments and the Majeurs Academy.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<FaqsPage />
		</>
	);
}
