import type { Metadata } from "next";
import BespokeProductPage from "@/components/pages/bespokeProduct";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/bespoke-product/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. The WP page is empty, so this copy is new. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "Bespoke furniture made to your size, finish and style in our Lagos workshop. Start a custom request or get a quote within 24 hours.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<BespokeProductPage />
		</>
	);
}
