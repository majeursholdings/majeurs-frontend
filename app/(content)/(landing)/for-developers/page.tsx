import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/common/routePlaceholder";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { PageHero } from "@/components/common/pageHero";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/for-developers/");

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
			<PageHero title={"For Architects and Developers"} />
			<section className="container-site py-12.5 md:py-20">
				<RoutePlaceholder variant="inline" title={page.title} wpPath={page.path} phase={page.phase} note={page.note} />
			</section>
		</>
	);
}
