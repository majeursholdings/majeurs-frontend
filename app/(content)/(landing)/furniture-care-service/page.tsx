import type { Metadata } from "next";
import FurnitureRepairPage from "@/components/pages/furnitureRepair";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";
import { getPageContent } from "@/lib/content/get";
import { furnitureCare } from "@/lib/content/pages/furnitureCare";

const page = getStaticPage("/furniture-care-service/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export async function generateMetadata(): Promise<Metadata> {
	const c = await getPageContent(furnitureCare);
	return seoMetadata(page.path, {
		title: c.seoTitle,
		description: c.seoDescription,
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<FurnitureRepairPage />
		</>
	);
}
