import type { Metadata } from "next";
import FurnitureRepairPage from "@/components/pages/furnitureRepair";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/furniture-care-service/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "Looking to have your old sofa or furniture fixed or professionally reshaped?",
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
