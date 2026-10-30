import type { Metadata } from "next";
import { CircleCheckBig } from "lucide-react";
import ConfirmationPage from "@/components/pages/confirmationPage";
import { tradeThanks } from "@/lib/content/pages/tradeThanks";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/majeurs-trade-program/majeurs-trade-program-registration-completed/");

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
			<ConfirmationPage page={tradeThanks} icon={CircleCheckBig} />
		</>
	);
}
