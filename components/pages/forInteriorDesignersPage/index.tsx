import Image from "next/image";
import { PageHero } from "@/components/common/pageHero";
import { buttonStyles, CtaLink } from "@/components/landing/ctaLink";
import { TrustStrip } from "@/components/landing/trustStrip";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { getPageContent } from "@/lib/content/get";
import { forInteriorDesigners } from "@/lib/content/pages/forInteriorDesigners";

/**
 * /for-interior-designers/: catalogue cards by room, the "Customize your furniture style" band and the trust strip.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/forInteriorDesigners.ts)
 */
export default async function ForInteriorDesignersPage() {
	const c = await getPageContent(forInteriorDesigners);
	return (
		<>
			<PageHero className="min-h-80 md:min-h-[480px]" title={c.heroTitle} description={c.heroText} image={c.heroImage}>
				<div className="pt-2">
					<CtaLink cta={c.heroCta} className={buttonStyles.outlineLight} />
				</div>
			</PageHero>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<ul className="container-site grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
					{c.collections.map((item) => (
						<li key={item.title} className="space-y-3">
							<div className="relative aspect-[4/3] overflow-hidden bg-sand-50">
								{item.image ? <Image src={item.image} alt="" fill sizes="(min-width: 1025px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" /> : null}
							</div>
							<h2 className="pt-1 font-display text-xl text-black">{item.title}</h2>
							<CtaLink cta={item.cta} className={buttonStyles.small} />
						</li>
					))}
				</ul>
			</section>

			<CustomizeCta fullBleed />

			<TrustStrip title={c.trustTitle} items={c.trust} />
		</>
	);
}
