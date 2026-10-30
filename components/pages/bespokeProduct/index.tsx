import Link from "next/link";
import { PageHero } from "@/components/common/pageHero";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { SplitFeature } from "@/components/landing/splitFeature";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { bespokeProduct } from "@/lib/content/pages/bespokeProduct";

/** First button solid, the rest outlined */
const buttonStyles = ["btn border-black bg-black text-white hover:border-gold hover:bg-gold", "btn border-black text-black hover:bg-black hover:text-white"];

/**
 * /bespoke-product/: empty on WP; a short page that explains commissions and routes to the request and quote forms.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/bespokeProduct.ts)
 */
export default async function BespokeProductPage() {
	const c = await getPageContent(bespokeProduct);
	return (
		<>
			<PageHero title={c.heroTitle} description={c.heroText} image={c.heroImage} />

			<SplitFeature
				image={c.introImage}
				imageAlt={c.introImageAlt}
				eyebrow={c.introEyebrow}
				title={c.introTitle}
				actions={
					<>
						{c.introCtas
							.filter(({ cta }) => cta.href)
							.map(({ cta }, i) => (
								<Link
									key={cta.href}
									href={cta.href}
									{...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
									className={buttonStyles[Math.min(i, 1)]}
								>
									{cta.label}
								</Link>
							))}
					</>
				}
			>
				{paragraphs(c.introText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<section className="bg-sand-50 px-2.5 py-12.5 md:px-5 md:py-20">
				<ol className="container-site grid gap-8 md:grid-cols-3">
					{c.steps.map((step, i) => (
						<li key={step.title} className="space-y-2 border-t border-black pt-5">
							<p className="text-h4 text-gold-muted">{String(i + 1).padStart(2, "0")}</p>
							<h2 className="text-lg text-black">{step.title}</h2>
							<p className="text-sm text-charcoal">{step.text}</p>
						</li>
					))}
				</ol>
			</section>

			<div className="pt-16 md:pt-24">
				<ShopNowBand />
			</div>
		</>
	);
}
