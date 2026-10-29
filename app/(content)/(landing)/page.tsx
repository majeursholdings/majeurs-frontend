import type { Metadata } from "next";
import HomePageComponents from "@/components/pages/homePage";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

/** Rank Math head for the home page (lib/seo.ts); until its headless endpoint is on, the root layout's title and description apply */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata("/");
}

export default function HomePage() {
	return (
		<>
			<SeoSchema path="/" />
			<HomePageComponents />
		</>
	);
}
