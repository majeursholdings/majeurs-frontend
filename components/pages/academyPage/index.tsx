import { BadgeCheck, Briefcase, Ruler, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { PageHero } from "@/components/common/pageHero";
import { buttonStyles, CtaLink } from "@/components/landing/ctaLink";
import { CheckList, FaqList, FeatureCards, ImageBanner, NumberedSteps, Section, StatList } from "@/components/landing/sections";
import { SplitFeature } from "@/components/landing/splitFeature";
import { YoutubeLite } from "@/components/pages/furnitureRepair/youtubeLite";
import { whatsappLink } from "@/lib/contact";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { academy } from "@/lib/content/pages/academy";
import { socials } from "./content";

const texts = (items: { text: string }[]) => items.map((i) => i.text);

/**
 * /majeurs-furniture-academy/: hero, key facts, the program (video), how it works, who it's for,
 * fees and funding, hiring graduates, partnering, FAQs, closing banner.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/academy.ts)
 */
export default async function AcademyPage() {
	const c = await getPageContent(academy);
	return (
		<>
			<PageHero eyebrow={c.heroEyebrow} title={c.heroTitle} description={c.heroText} image={c.heroImage} size="tall">
				<div className="space-y-3 pt-3">
					<CtaLink cta={c.heroCta} className={buttonStyles.light} />
					<p className="text-xs text-sand">{c.heroFootnote}</p>
				</div>
			</PageHero>

			<section className="border-b border-sand px-2.5 py-10 md:px-5 md:py-14">
				<StatList stats={c.facts} className="container-site" />
			</section>

			<SplitFeature image="" media={<YoutubeLite id={c.programVideoId} title={c.programVideoTitle} />} eyebrow={c.programEyebrow} title={c.programTitle}>
				{paragraphs(c.programText).map((p) => (
					<p key={p}>{p}</p>
				))}
				<p className="pt-2 text-black">{c.gainsTitle}</p>
				<CheckList items={texts(c.gains)} />
			</SplitFeature>

			<Section eyebrow={c.stepsEyebrow} title={c.stepsTitle} tone="cream">
				<NumberedSteps steps={c.steps} />
			</Section>

			<Section eyebrow={c.fitEyebrow} title={c.fitTitle}>
				<FeatureCards
					columns={2}
					cards={[
						{ title: c.forYouTitle, points: texts(c.forYou) },
						{ title: c.notForYouTitle, points: texts(c.notForYou), pointIcon: X },
					]}
				/>
			</Section>

			<Section id="fees" eyebrow={c.fundingEyebrow} title={c.fundingTitle} intro={c.fundingText} tone="cream">
				<FeatureCards
					columns={2}
					cards={c.tracks.map((t) => ({ title: t.title, subtitle: t.subtitle, points: texts(t.points), action: <CtaLink cta={c.heroCta} className={buttonStyles.outline} /> }))}
				/>
			</Section>

			<Section eyebrow={c.hireEyebrow} title={c.hireTitle} intro={c.hireText}>
				<FeatureCards cards={c.hireCards.map((card, i) => ({ ...card, icon: [Ruler, BadgeCheck, Briefcase][i % 3] }))} />
				<div className="flex flex-wrap justify-center gap-3">
					<a href={whatsappLink(c.hireMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles.primary}>
						<BrandIcon name="whatsapp" className="size-4" />
						{c.hireButton}
					</a>
					<CtaLink cta={c.hireContactCta} className={buttonStyles.outline} />
				</div>
			</Section>

			<Section eyebrow={c.sponsorEyebrow} title={c.sponsorTitle} intro={c.sponsorText} tone="cream">
				<FeatureCards cards={c.sponsorships} />
			</Section>

			<Section eyebrow={c.faqEyebrow} title={c.faqTitle} narrow>
				<FaqList items={c.faqs} />
			</Section>

			<ImageBanner image={c.startImage} eyebrow={c.startEyebrow} title={c.startTitle} text={c.startText}>
				<CtaLink cta={c.startCta} className={buttonStyles.light} />
				<ul className="flex w-full justify-center gap-2 pt-2">
					{socials.map((s) => (
						<li key={s.label}>
							<a
								href={s.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`Majeurs Academy on ${s.label}`}
								className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white hover:text-black"
							>
								<BrandIcon name={s.icon} className="size-4" />
							</a>
						</li>
					))}
				</ul>
			</ImageBanner>
		</>
	);
}
