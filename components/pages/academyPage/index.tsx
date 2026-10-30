import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { SectionIntro, SplitFeature } from "@/components/landing/splitFeature";
import { YoutubeLite } from "@/components/pages/furnitureRepair/youtubeLite";
import { whatsappLink } from "@/lib/contact";
import { getPageContent } from "@/lib/content/get";
import { paragraphs, type Cta } from "@/lib/content/model";
import { academy } from "@/lib/content/pages/academy";
import { socials } from "./content";

/** A button from a link field: WhatsApp and other external links open in a new tab */
function CtaLink({ cta, className }: { cta: Cta; className: string }) {
	if (!cta.href) return null;
	return cta.external ? (
		<a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
			{cta.label}
		</a>
	) : (
		<Link href={cta.href} className={className}>
			{cta.label}
		</Link>
	);
}

function List({ items, icon: Icon = Check, tone = "text-gold" }: { items: string[]; icon?: typeof Check; tone?: string }) {
	return (
		<ul className="space-y-2 text-sm text-charcoal">
			{items.map((item) => (
				<li key={item} className="flex gap-2.5">
					<Icon className={`mt-1 size-3.5 shrink-0 ${tone}`} aria-hidden />
					{item}
				</li>
			))}
		</ul>
	);
}

function ImageCard({ image, title, subtitle, children }: { image: string; title: string; subtitle?: string; children: React.ReactNode }) {
	return (
		<div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center">
			<div className="relative aspect-[4/3] overflow-hidden bg-sand-50">
				<Image src={image} alt="" fill sizes="(min-width: 1025px) 25vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
			</div>
			<div className="space-y-3">
				<h3 className="text-lg text-black">{title}</h3>
				{subtitle ? <p className="text-xs text-charcoal">{subtitle}</p> : null}
				{children}
			</div>
		</div>
	);
}

/**
 * /majeurs-furniture-academy/: the 6-month diploma program, hiring graduates and sponsorship.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/academy.ts)
 */
export default async function AcademyPage() {
	const c = await getPageContent(academy);
	return (
		<>
			{/* Hero */}
			<section className="px-2.5 py-20 md:px-5 md:py-28">
				<div className="container-site max-w-3xl space-y-5 lg:mx-0 lg:ml-[max(1.25rem,calc((100vw-90rem)/2))]">
					<p className="eyebrow">{c.heroEyebrow}</p>
					<h1 className="font-display text-h2">{c.heroTitle}</h1>
					<div className="space-y-2 text-sm text-charcoal md:text-base">
						{paragraphs(c.heroText).map((p) => (
							<p key={p}>{p}</p>
						))}
					</div>
					<p className="text-xs text-black">{c.heroNote}</p>
					<CtaLink cta={c.heroCta} className="btn border-black text-black hover:bg-black hover:text-white" />
					<p className="text-xs text-grey">{c.heroFootnote}</p>
				</div>
			</section>

			{/* What this program is */}
			<SplitFeature image="" media={<YoutubeLite id={c.programVideoId} title={c.programVideoTitle} />} title={c.programTitle} className="pt-0 md:pt-0">
				{paragraphs(c.programText).map((p) => (
					<p key={p}>{p}</p>
				))}
				<p className="pt-2 text-black">{c.gainsTitle}</p>
				<List items={c.gains.map((g) => g.text)} />
			</SplitFeature>

			{/* Who this is for */}
			<section className="bg-sand px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro title={c.audienceTitle}>
						{paragraphs(c.audienceText).map((p) => (
							<p key={p}>{p}</p>
						))}
						<p className="mt-3 text-xs text-black">
							<span className="text-charcoal">{c.sessionLabel}</span>
							{` ${c.session} `}
							<span className="mx-2 text-grey">•</span>
							<span className="text-charcoal">{c.priceLabel}</span>
							{` ${c.price}`}
						</p>
					</SectionIntro>
					<div className="grid gap-10 lg:grid-cols-2">
						<ImageCard image={c.forYouImage} title={c.forYouTitle}>
							<List items={c.forYou.map((p) => p.text)} />
						</ImageCard>
						<ImageCard image={c.notForYouImage} title={c.notForYouTitle}>
							<List items={c.notForYou.map((p) => p.text)} icon={X} tone="text-charcoal" />
						</ImageCard>
					</div>
				</div>
			</section>

			{/* Funding options */}
			<section className="px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro title={c.fundingTitle}>
						{paragraphs(c.fundingText).map((p) => (
							<p key={p}>{p}</p>
						))}
					</SectionIntro>
					<div className="grid gap-10 lg:grid-cols-2">
						{c.tracks.map((t) => (
							<ImageCard key={t.title} image={t.image} title={t.title} subtitle={t.subtitle}>
								<List items={t.points.map((p) => p.text)} />
							</ImageCard>
						))}
					</div>
				</div>
			</section>

			{/* Hire a graduate */}
			<section className="px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-8">
					<div className="max-w-3xl space-y-3">
						<p className="eyebrow">{c.hireEyebrow}</p>
						<h2 className="font-display text-h3">{c.hireTitle}</h2>
						{paragraphs(c.hireText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
					</div>
					<ul className="grid gap-4 md:grid-cols-3">
						{c.hireCards.map((card) => (
							<li key={card.title} className="space-y-3 bg-sand p-6">
								<h3 className="text-lg text-black">{card.title}</h3>
								<p className="text-sm text-charcoal">{card.text}</p>
							</li>
						))}
					</ul>
					<div className="flex flex-wrap gap-3">
						<a
							href={whatsappLink(c.hireMessage)}
							target="_blank"
							rel="noopener noreferrer"
							className="btn border-black bg-black text-white hover:border-gold hover:bg-gold"
						>
							{c.hireButton}
						</a>
						<CtaLink cta={c.hireContactCta} className="btn border-black text-black hover:bg-black hover:text-white" />
					</div>
				</div>
			</section>

			{/* Become a sponsor */}
			<section className="px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro title={c.sponsorTitle}>
						{paragraphs(c.sponsorText).map((p) => (
							<p key={p}>{p}</p>
						))}
					</SectionIntro>
					<ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
						{c.sponsorships.map((s) => (
							<li key={s.title} className="flex flex-col gap-3">
								<div className="relative aspect-[3/2] overflow-hidden bg-sand-50">
									<Image src={s.image} alt="" fill sizes="(min-width: 1025px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
								</div>
								<h3 className="text-lg text-black">{s.title}</h3>
								<p className="text-sm text-charcoal">{s.text}</p>
								<CtaLink cta={s.cta} className="btn mt-auto w-fit border-black px-4 py-2 text-xs text-black hover:bg-black hover:text-white" />
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Get started */}
			<section className="relative isolate overflow-hidden px-2.5 py-20 text-center md:px-5 md:py-32">
				<Image src={c.startImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
				<div className="absolute inset-0 -z-10 bg-black/80" aria-hidden />
				<div className="mx-auto max-w-2xl space-y-5 text-white">
					<p className="text-xs uppercase tracking-eyebrow text-sand">{c.startEyebrow}</p>
					<h2 className="font-display text-h3 text-white">{c.startTitle}</h2>
					{paragraphs(c.startText).map((p) => (
						<p key={p} className="text-sm text-sand">
							{p}
						</p>
					))}
					<ul className="flex justify-center gap-2">
						{socials.map((s) => (
							<li key={s.label}>
								<a
									href={s.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Majeurs Academy on ${s.label}`}
									className="flex size-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-gold hover:text-white"
								>
									<BrandIcon name={s.icon} className="size-4" />
								</a>
							</li>
						))}
					</ul>
					<CtaLink cta={c.startCta} className="btn border-white bg-white text-black hover:bg-black hover:text-white" />
				</div>
			</section>
		</>
	);
}
