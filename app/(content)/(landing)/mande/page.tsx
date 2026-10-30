import type { Metadata } from "next";
import MandePage from "@/components/pages/mandePage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/mande/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<MandePage />
		</>
	);
}
