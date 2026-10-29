import type { Metadata } from "next";
import ShowroomsPage from "@/components/pages/showroomsPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/showrooms/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "Visit the Majeurs showroom and workshop in Lekki Phase 1, Lagos, by appointment. Styling consultations, shopping advice and workshop walk-throughs.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<ShowroomsPage />
		</>
	);
}
