import type { Metadata } from "next";
import CustomRequestPage from "@/components/pages/customRequest";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/custom-made-furniture-in-lagos/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: "Custom Furniture Makers in Lagos – Made to Order",
		description:
			"Custom furniture made to order in our Lagos workshop: sofas, beds, kitchens and office fit-outs built to your size, with a 12-month warranty. Get a quote.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<CustomRequestPage />
		</>
	);
}
