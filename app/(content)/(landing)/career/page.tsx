import type { Metadata } from "next";
import CareersPage from "@/components/pages/careersPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/career/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "Join Majeurs: open roles across furniture production, the Majeurs Furniture Academy, sales and digital in Lagos.",
		alternates: { canonical: "/career/" },
	});
}

/** Openings are cached ("careers"), so the page prerenders */
export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<CareersPage />
		</>
	);
}
