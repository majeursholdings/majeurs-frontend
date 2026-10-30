import { CircleCheck } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { buttonStyles, CtaLink } from "@/components/landing/ctaLink";
import { SplitFeature } from "@/components/landing/splitFeature";
import { getPageContent } from "@/lib/content/get";
import { paragraphs, type Cta } from "@/lib/content/model";
import { mande } from "@/lib/content/pages/mande";

/** First button solid, the rest outlined */
function Buttons({ ctas }: { ctas: { cta: Cta }[] }) {
	return (
		<>
			{ctas.map(({ cta }, i) => (
				<CtaLink key={cta.href} cta={cta} className={i === 0 ? buttonStyles.primary : buttonStyles.outline} />
			))}
		</>
	);
}

/**
 * /mande/: the MANDE makers community, with its demo and registration links going to mande.com.ng.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/mande.ts)
 */
export default async function MandePage() {
	const c = await getPageContent(mande);
	return (
		<>
			<PageHero className="min-h-80 md:min-h-[480px]" title={c.heroTitle} description={c.heroText} image={c.heroImage} />

			<SplitFeature image={c.aboutImage} imageAlt={c.aboutImageAlt} title={c.aboutTitle} className="md:py-25" actions={<Buttons ctas={c.aboutCtas} />}>
				{paragraphs(c.aboutText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<SplitFeature
				className="bg-sand md:py-25"
				image={c.accessImage}
				imageAlt={c.accessImageAlt}
				imageSide="right"
				eyebrow={c.accessEyebrow}
				title={c.accessTitle}
				actions={<Buttons ctas={c.accessCtas} />}
			>
				<ul className="space-y-2">
					{c.accessPerks.map(({ perk }) => (
						<li key={perk} className="flex gap-2">
							<CircleCheck className="mt-0.5 size-4 shrink-0 text-black" strokeWidth={1.5} aria-hidden />
							{perk}
						</li>
					))}
				</ul>
			</SplitFeature>
		</>
	);
}
