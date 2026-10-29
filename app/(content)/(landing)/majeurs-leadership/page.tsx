import type { Metadata } from "next";
import LeadershipPage from "@/components/pages/leadershipPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/majeurs-leadership/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description:
			"CEO and Founder Demi Samande leads Majeurs Leadership, supported by a board with strong experience in brand, venture growth, operations and talent.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<LeadershipPage />
		</>
	);
}
