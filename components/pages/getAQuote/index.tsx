import { PageHero } from "@/components/common/pageHero";
import { BESPOKE_INTRO, FormSection } from "@/components/pages/customRequest/formSection";
import { QuoteForm } from "./quoteForm";
import { WP_URL } from "@/lib/api/wp";

/** /get-a-quote-for-custom-made-furniture-in-lagos/: hero with "Get started", then the quote form */
export default function GetAQuotePage() {
	return (
		<>
			<PageHero
				title="Get A Quote In Less Than 24 Hrs"
				image={`${WP_URL}/wp-content/uploads/close-up-shoot-showing-Majeurs-workman-making-a-marking-on-a-wood-piece-1.webp`}
				// the Nordique Pro demo font draws "4" as a DEMO watermark, so this title uses the sans font until the licensed font lands
				className="md:min-h-82 [&_h1]:font-sans [&_h1]:font-light"
				priCta={{ slug: "#quote", label: "Get started" }}
			/>
			<FormSection id="quote" title="Dimensions · Finishes · Timeline" intro={BESPOKE_INTRO}>
				<QuoteForm />
			</FormSection>
		</>
	);
}
