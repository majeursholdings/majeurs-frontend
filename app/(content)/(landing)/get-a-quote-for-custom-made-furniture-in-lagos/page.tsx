import type { Metadata } from "next";
import GetAQuotePage from "@/components/pages/getAQuote";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/get-a-quote-for-custom-made-furniture-in-lagos/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description:
			"Tell us about your bespoke furniture or interior project. Share dimensions, materials, finishes and delivery window. We’ll scope options, align on budget and propose a sustainable, high-quality build plan.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<GetAQuotePage />
		</>
	);
}
