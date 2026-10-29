import type { Metadata } from "next";
import AcademyPage from "@/components/pages/academyPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/majeurs-furniture-academy/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description:
			"A 6-month, hands-on furniture making and manufacturing programme in Lagos, taught in a working factory. Two cohorts a year. Apply for the next intake.",
		alternates: { canonical: "/majeurs-furniture-academy/" },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<AcademyPage />
		</>
	);
}
