import type { Metadata } from "next";
import { CircleCheckBig } from "lucide-react";
import ConfirmationPage from "@/components/pages/confirmationPage";
import { quoteThanks } from "@/lib/content/pages/quoteThanks";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/get-a-quote-for-custom-made-furniture-in-lagos/quote-request-received/");

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
			<ConfirmationPage page={quoteThanks} icon={CircleCheckBig} />
		</>
	);
}
