import type { Metadata } from "next";
import MaterialsCarePage from "@/components/pages/materialsCarePage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/materials-and-care/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "Our leather, velvet and upholstery fabrics, with care and cleaning guidance for each.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<MaterialsCarePage />
		</>
	);
}
