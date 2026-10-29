import type { Metadata } from "next";
import TradeProgramPage from "@/components/pages/tradeProgramPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/majeurs-trade-program/");
const description =
	"Architects, interior designers, property developers, hoteliers and procurement teams: work directly with the manufacturer behind the furniture, with trade discounts of up to 20%.";

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description,
		alternates: { canonical: page.path },
		openGraph: { title: page.title, description, url: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<TradeProgramPage />
		</>
	);
}
