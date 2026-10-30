import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/common/pageHero";
import { SectionIntro, SplitFeature } from "@/components/landing/splitFeature";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { getPageContent } from "@/lib/content/get";
import { paragraphs, type Cta } from "@/lib/content/model";
import { about } from "@/lib/content/pages/about";
import { cn } from "@/lib/utils";

/** Small outlined button used under cards on the About page */
export const smallButton = "btn px-4 py-2 text-xs border-black text-black hover:bg-black hover:text-white";

function CardLink({ cta }: { cta: Cta }) {
	if (!cta.href) return null;
	return cta.external ? (
		<a href={cta.href} target="_blank" rel="noopener noreferrer" className={smallButton}>
			{cta.label}
		</a>
	) : (
		<Link href={cta.href} className={smallButton}>
			{cta.label}
		</Link>
	);
}

function CardImage({ src, aspect = "aspect-[4/3]", sizes }: { src: string; aspect?: string; sizes: string }) {
	return (
		<div className={cn("relative overflow-hidden bg-sand-50", aspect)}>
			<Image src={src} alt="" fill sizes={sizes} className="object-cover" />
		</div>
	);
}

/** Copy and images from the page's fields in wp-admin (lib/content/pages/about.ts) */
export default async function AboutPage() {
	const c = await getPageContent(about);
	return (
		<>
			<PageHero className="min-h-80 md:min-h-[420px]" title={c.heroTitle} image={c.heroImage} overlayClassName="bg-black/65">
				{paragraphs(c.heroText).map((p) => (
					<p key={p} className="mx-auto max-w-xl text-base text-sand md:text-lg">
						{p}
					</p>
				))}
			</PageHero>

			<SplitFeature image={c.aboutImage} title={c.aboutTitle}>
				{paragraphs(c.aboutText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<SplitFeature image={c.storyImage} imageSide="right" title={c.storyTitle} className="pt-0 md:pt-0">
				{paragraphs(c.storyText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<section className="bg-cream px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid gap-10 md:grid-cols-2 md:gap-12">
					{c.values.map((v) => (
						<div key={v.title} className="grid grid-cols-[2fr_3fr] items-center gap-5">
							<CardImage src={v.image} sizes="(min-width: 768px) 20vw, 40vw" />
							<div className="space-y-2">
								<p className="text-xs uppercase tracking-button text-black">{v.eyebrow}</p>
								<h3 className="font-display text-xl text-black">{v.title}</h3>
								<p className="text-sm text-charcoal">{v.text}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="bg-sand px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro eyebrow={c.pillarsEyebrow} title={c.pillarsTitle}>
						{c.pillarsText}
					</SectionIntro>
					<div className="grid gap-10 md:grid-cols-3 md:gap-5">
						{c.pillars.map((p) => (
							<article key={p.title} className="flex flex-col gap-3">
								<CardImage src={p.image} sizes="(min-width: 768px) 33vw, 100vw" />
								<p className="mt-2 text-xs uppercase tracking-button text-black">{p.eyebrow}</p>
								<h3 className="font-display text-xl text-black">{p.title}</h3>
								<p className="flex-1 text-sm text-charcoal">{p.text}</p>
								<div>
									<CardLink cta={p.cta} />
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<SplitFeature
				image={c.tradeImage}
				eyebrow={c.tradeEyebrow}
				title={c.tradeTitle}
				actions={
					<>
						{c.tradeCtas.map(({ cta }) => (
							<CardLink key={cta.href} cta={cta} />
						))}
					</>
				}
			>
				{paragraphs(c.tradeText).map((p) => (
					<p key={p}>{p}</p>
				))}
				<ul className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
					{c.tradeTiers.map((t) => (
						<li key={t.name} className="border border-sand p-4">
							<p className="text-xs uppercase tracking-button text-gold-muted">{t.name}</p>
							<p className="mt-1 text-lg text-black">{t.discount}</p>
							<p className="mt-1 text-xs text-grey">{t.spend}</p>
						</li>
					))}
				</ul>
			</SplitFeature>

			<section className="px-2.5 pb-12.5 md:px-5 md:pb-20">
				<div className="container-site grid gap-10 md:grid-cols-2 md:gap-12">
					{c.people.map((p) => (
						<article key={p.title} className="space-y-3">
							<CardImage src={p.image} sizes="(min-width: 768px) 50vw, 100vw" />
							<h2 className="pt-1 font-display text-xl text-black">{p.title}</h2>
							<CardLink cta={p.cta} />
						</article>
					))}
				</div>
			</section>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro eyebrow={c.projectsEyebrow} title={c.projectsTitle}>
						{c.projectsText}
					</SectionIntro>
					<div className="grid gap-10 md:grid-cols-2 md:gap-12">
						{c.projects.map((p) => (
							<article key={p.title} className="space-y-3">
								<CardImage src={p.image} sizes="(min-width: 768px) 50vw, 100vw" />
								<p className="pt-1 text-xs uppercase tracking-button text-black">{p.eyebrow}</p>
								<h3 className="font-display text-xl text-black">{p.title}</h3>
								<p className="text-sm text-charcoal">{p.text}</p>
								<CardLink cta={p.cta} />
							</article>
						))}
					</div>
				</div>
			</section>

			<CustomizeCta fullBleed image={c.ctaImage} />
		</>
	);
}
