import type { Metadata } from "next";
import LegalPage from "@/components/pages/legalPage";
import { refundReturns } from "@/lib/content/pages/refundReturns";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/refund_returns/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<LegalPage page={refundReturns} />
		</>
	);
}
