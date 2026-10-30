import { PageHero } from "@/components/common/pageHero";
import { BrandIcon } from "@/components/common/brandIcons";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { SplitFeature } from "@/components/landing/splitFeature";
import { whatsappLink } from "@/lib/contact";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { customRequest } from "@/lib/content/pages/customRequest";
import { CustomRequestForm } from "./customRequestForm";
import { FormSection } from "./formSection";

/**
 * /custom-made-furniture-in-lagos/: hero, "Custom made Furniture" split, the request form, Shop Now closer.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/customRequest.ts)
 */
export default async function CustomRequestPage() {
	const c = await getPageContent(customRequest);
	return (
		<>
			<PageHero title={c.heroTitle} description={c.heroText} image={c.heroImage} />

			<SplitFeature
				image={c.introImage}
				imageAlt={c.introImageAlt}
				title={c.introTitle}
				actions={
					<>
						{c.introCta.href ? (
							<a
								href={c.introCta.href}
								{...(c.introCta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
								className="btn border-black text-black hover:bg-black hover:text-white"
							>
								{c.introCta.label}
							</a>
						) : null}
						{c.whatsappLabel ? (
							<a
								href={whatsappLink(c.whatsappMessage || undefined)}
								target="_blank"
								rel="noopener noreferrer"
								className="btn border-black bg-black text-white hover:border-gold hover:bg-gold"
							>
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

			<FormSection id="request" title={c.formTitle} intro={c.formIntro}>
				<CustomRequestForm />
			</FormSection>

			<ShopNowBand />
		</>
	);
}
