import type { Metadata } from "next";
import RootAndReverencePage from "@/components/pages/rootAndReverencePage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/root-and-reverence-collection/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "A debut collection by Majeurs Holdings",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<RootAndReverencePage />
		</>
	);
}
