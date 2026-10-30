import Image from "next/image";
import { PageHero } from "@/components/common/pageHero";
import { buttonStyles, CtaLink } from "@/components/landing/ctaLink";
import { SectionIntro, SplitFeature } from "@/components/landing/splitFeature";
import { TrustStrip } from "@/components/landing/trustStrip";
import { paragraphs, type Values } from "@/lib/content/model";
import type { collectionsLandingFields } from "@/lib/content/pages/collectionsLanding";
import { cn } from "@/lib/utils";

export type CollectionsLandingContent = Values<ReturnType<typeof collectionsLandingFields>>;

/** "One item per line" textarea -> items */
const lines = (value: string) =>
	value
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);

function Bullets({ value }: { value: string }) {
	return (
		<ul className="list-disc space-y-1 pl-5">
			{lines(value).map((item) => (
				<li key={item}>{item}</li>
			))}
		</ul>
	);
}

/**
 * The WP trade landing pages for architects/developers and for interior designers: hero, collections, what we offer,
 * pricing series, trade tiers, warranty, crafts gallery, trust strip and the consultation and Trade Program CTAs.
 */
export function CollectionsLanding({ c }: { c: CollectionsLandingContent }) {
	return (
		<>
			<PageHero eyebrow={c.heroEyebrow} title={c.heroTitle} image={c.heroImage} className="min-h-105 md:min-h-[560px]" overlayClassName="bg-black/60">
				{paragraphs(c.heroText).map((p) => (
					<p key={p} className="mx-auto max-w-2xl text-sm text-sand">
						{p}
					</p>
				))}
				<div className="flex flex-wrap justify-center gap-3 pt-4">
					{c.heroCtas.map(({ cta }, i) => (
						<CtaLink key={cta.href} cta={cta} className={i === 0 ? buttonStyles.outlineLight : buttonStyles.light} />
					))}
				</div>
			</PageHero>

			<SplitFeature
				image={c.introImage}
				imageAlt={c.introImageAlt}
				imageSide="right"
				title={c.introTitle}
				className="md:py-25"
				actions={<CtaLink cta={c.introCta} className={buttonStyles.outline} />}
			>
				{paragraphs(c.introText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<section className="px-2.5 pb-12.5 md:px-5 md:pb-20">
				<div className="container-site space-y-10">
					<SectionIntro title={c.collectionsTitle}>{c.collectionsText}</SectionIntro>
					<ul className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
						{c.collections.map((item) => (
							<li key={item.title} className="space-y-3">
								<div className="relative aspect-square overflow-hidden bg-sand-50">
									{item.image ? <Image src={item.image} alt="" fill sizes="(min-width: 1025px) 25vw, 50vw" className="object-cover" /> : null}
								</div>
								<h3 className="pt-1 font-display text-lg text-black">{item.title}</h3>
								<CtaLink cta={item.cta} className={buttonStyles.small} />
							</li>
						))}
					</ul>
				</div>
			</section>

			<SplitFeature
				className="bg-sand-50"
				image={c.offerImage}
				imageSide="right"
				title={c.offerTitle}
				actions={c.offerCta.href ? <CtaLink cta={c.offerCta} className={buttonStyles.outline} /> : undefined}
			>
				{paragraphs(c.offerText).map((p) => (
					<p key={p}>{p}</p>
				))}
				{c.offerPoints.length ? (
					<ul className="list-disc space-y-1 pl-5">
						{c.offerPoints.map(({ point }) => (
							<li key={point}>{point}</li>
						))}
					</ul>
				) : null}
			</SplitFeature>

			<section className="px-2.5 pt-12.5 md:px-5 md:pt-24">
				<SectionIntro className="container-site" title={c.pricingTitle}>
					{c.pricingText}
				</SectionIntro>
			</section>
			{c.series.map((s, i) => (
				<SplitFeature
					key={s.title}
					className="md:py-12"
					image={s.image}
					imageSide={i % 2 === 0 ? "right" : "left"}
					eyebrow={s.eyebrow}
					title={s.title}
					as="h3"
					actions={s.cta.href ? <CtaLink cta={s.cta} className={buttonStyles.small} /> : undefined}
				>
					{paragraphs(s.text).map((p) => (
						<p key={p}>{p}</p>
					))}
					<h4 className="pt-2 text-sm text-black">{c.pricesLabel}</h4>
					<Bullets value={s.prices} />
					<h4 className="pt-2 text-sm text-black">{c.includesLabel}</h4>
					<Bullets value={s.includes} />
				</SplitFeature>
			))}

			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site space-y-10">
					<SectionIntro title={c.tiersTitle}>{c.tiersText}</SectionIntro>
					<ul className="grid gap-4 md:grid-cols-3">
						{c.tiers.map((t) => (
							<li key={t.name} className="space-y-3 border border-cream bg-cream/30 p-6 text-center md:p-8">
								<p className="text-black">
									<span className="text-h2">{t.discount}</span> <span className="text-xs uppercase tracking-button">{c.discountLabel}</span>
								</p>
								<p className="text-xs uppercase tracking-button text-gold-muted">{t.name}</p>
								<p className="text-sm text-black">{t.spend}</p>
								<p className="text-sm text-charcoal">{t.perks}</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="bg-sand-50 px-2.5 pt-12.5 md:px-5 md:pt-24">
				<SectionIntro className="container-site" title={c.warrantyTitle}>
					{c.warrantyText}
				</SectionIntro>
			</section>
			{c.warrantyBlocks.map((b, i) => (
				<SplitFeature
					key={b.image || i}
					className={cn("bg-sand-50 md:py-12", i === c.warrantyBlocks.length - 1 && "pb-12.5 md:pb-24")}
					image={b.image}
					imageSide={i % 2 === 0 ? "right" : "left"}
					eyebrow={b.eyebrow || undefined}
					title={b.groups[0]?.title ?? ""}
					as="h3"
				>
					{b.groups.map((g, j) => (
						<div key={g.title} className="space-y-2">
							{j > 0 ? <h4 className="pt-2 text-base text-black">{g.title}</h4> : null}
							<Bullets value={g.items} />
						</div>
					))}
				</SplitFeature>
			))}

			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site space-y-10">
					<SectionIntro title={c.galleryTitle}>{c.galleryText}</SectionIntro>
					<ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
						{c.gallery.map(({ image }) => (
							<li key={image} className="relative aspect-square overflow-hidden bg-sand-50">
								<Image src={image} alt="" fill sizes="(min-width: 1025px) 16vw, (min-width: 768px) 25vw, 50vw" className="object-cover" />
							</li>
						))}
					</ul>
					<div className="text-center">
						<CtaLink cta={c.galleryCta} className={buttonStyles.outline} />
					</div>
				</div>
			</section>

			<div className="border-t border-sand">
				<TrustStrip title={c.trustTitle} items={c.trust} />
			</div>

			<section className="px-2.5 pb-12.5 md:px-5 md:pb-20">
				<div className="container-site max-w-4xl space-y-4 bg-black px-6 py-12 text-center md:px-16 md:py-16">
					<h2 className="text-h3 font-display text-white">{c.visionTitle}</h2>
					{paragraphs(c.visionText).map((p) => (
						<p key={p} className="mx-auto max-w-2xl text-sm text-sand">
							{p}
						</p>
					))}
					<div className="pt-2">
						<CtaLink cta={c.visionCta} className={buttonStyles.light} />
					</div>
				</div>
			</section>

			<section className="bg-cream px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="mx-auto max-w-2xl space-y-4 text-center">
					<h2 className="text-h3 font-display">{c.joinTitle}</h2>
					{paragraphs(c.joinText).map((p) => (
						<p key={p} className="text-sm text-charcoal">
							{p}
						</p>
					))}
					<div className="pt-2">
						<CtaLink cta={c.joinCta} className={buttonStyles.primary} />
					</div>
				</div>
			</section>
		</>
	);
}
