import type { Metadata } from "next";
import ContactPage from "@/components/pages/contactPage";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/contact-majeurs-holdings/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		description: "Contact Majeurs Holdings: our Lagos headquarters and showroom in Lekki, our London office, customer service and partnerships.",
		alternates: { canonical: page.path },
	});
}

export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<ContactPage />
		</>
	);
}
