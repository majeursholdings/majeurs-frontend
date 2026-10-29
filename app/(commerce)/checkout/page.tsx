import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/common/routePlaceholder";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/checkout/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, { title: page.title }, { robots: { index: false, follow: false } });
}

export default function Page() {
	return (
		<div className="space-y-8">
			<h1 className="text-h2">{"Checkout"}</h1>
			<RoutePlaceholder variant="inline" title={page.title} wpPath={page.path} phase={page.phase} note={page.note} />
		</div>
	);
}
