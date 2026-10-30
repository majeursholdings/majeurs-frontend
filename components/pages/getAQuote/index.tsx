import { PageHero } from "@/components/common/pageHero";
import { FormSection } from "@/components/pages/customRequest/formSection";
import { getPageContent } from "@/lib/content/get";
import { getAQuote } from "@/lib/content/pages/getAQuote";
import { QuoteForm } from "./quoteForm";

/**
 * /get-a-quote-for-custom-made-furniture-in-lagos/: hero with "Get started", then the quote form.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/getAQuote.ts)
 */
export default async function GetAQuotePage() {
	const c = await getPageContent(getAQuote);
	return (
		<>
			<PageHero
				title={c.heroTitle}
				image={c.heroImage}
				// the Nordique Pro demo font draws "4" as a DEMO watermark, so this title uses the sans font until the licensed font lands
				className="md:min-h-82 [&_h1]:font-sans [&_h1]:font-light"
				priCta={c.heroCta.href ? { slug: c.heroCta.href, label: c.heroCta.label } : undefined}
			/>
			<FormSection id="quote" title={c.formTitle} intro={c.formIntro}>
				<QuoteForm />
			</FormSection>
		</>
	);
}
