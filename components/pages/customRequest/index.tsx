import { HeartHandshake, ShieldCheck, SwatchBook } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { BrandIcon } from "@/components/common/brandIcons";
import { buttonStyles } from "@/components/landing/ctaLink";
import { FeatureCards, ImageBanner, NumberedSteps, Section, type FeatureCardData } from "@/components/landing/sections";
import { SplitFeature } from "@/components/landing/splitFeature";
import { QuoteButton } from "@/components/pages/getAQuote/quoteDialog";
import { whatsappLink } from "@/lib/contact";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { customRequest } from "@/lib/content/pages/customRequest";

/**
 * /custom-made-furniture-in-lagos/: hero, intro split, how it works, warranty / materials / care cards,
 * closing banner, Shop Now. Every "Get a quote" button opens the quote form in a pop-up.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/customRequest.ts)
 */
export default async function CustomRequestPage() {
	const c = await getPageContent(customRequest);
	const quote = { label: c.quoteLabel, title: c.quoteTitle, text: c.quoteText };

	const texts = (items: { text: string }[]) => items.map((i) => i.text);
	const assurances: FeatureCardData[] = [
		{ icon: ShieldCheck, title: c.warrantyTitle, text: c.warrantyText, points: texts(c.warrantyPoints), cta: c.warrantyCta },
		{ icon: SwatchBook, title: c.materialsTitle, text: c.materialsText, points: texts(c.materialsPoints), cta: c.materialsCta },
		{ icon: HeartHandshake, title: c.careTitle, text: c.careText, points: texts(c.carePoints), cta: c.careCta },
	];

	return (
		<>
			<PageHero eyebrow={c.heroEyebrow} title={c.heroTitle} description={c.heroText} image={c.heroImage} />

			<SplitFeature
				image={c.introImage}
				imageAlt={c.introImageAlt}
				eyebrow={c.introEyebrow}
				title={c.introTitle}
				actions={
					<>
						<QuoteButton {...quote} className={buttonStyles.primary} />
						{c.whatsappLabel ? (
							<a href={whatsappLink(c.whatsappMessage || undefined)} target="_blank" rel="noopener noreferrer" className={buttonStyles.outline}>
								<BrandIcon name="whatsapp" className="size-4" />
								{c.whatsappLabel}
							</a>
						) : null}
					</>
				}
			>
				{paragraphs(c.introText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<Section eyebrow={c.stepsEyebrow} title={c.stepsTitle} tone="cream">
				<NumberedSteps steps={c.steps} />
			</Section>

			<Section eyebrow={c.assuranceEyebrow} title={c.assuranceTitle}>
				<FeatureCards cards={assurances} />
			</Section>

			<ImageBanner image={c.closingImage} title={c.closingTitle} text={c.closingText}>
				<QuoteButton {...quote} className={buttonStyles.light} />
			</ImageBanner>
		</>
	);
}
