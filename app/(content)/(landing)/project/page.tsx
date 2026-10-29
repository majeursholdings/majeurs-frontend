import type { Metadata } from "next";
import ProjectsPage from "@/components/pages/projectsPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/project/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "Completed residential, hospitality and commercial interiors designed, made and installed by Majeurs in Lagos.",
		alternates: { canonical: "/project/" },
	});
}

/** Projects are cached ("project-list"), so the archive prerenders */
export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<ProjectsPage />
		</>
	);
}
