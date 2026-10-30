import Image from "next/image";
import Link from "next/link";
import { Check, MoveRight } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { TradeApplyForm } from "./applyForm";
import { TradeFaq } from "./faq";
import { TradeInsights } from "./insights";
import { getPageContent } from "@/lib/content/get";
import { paragraphs, type Cta } from "@/lib/content/model";
import { tradeProgram } from "@/lib/content/pages/tradeProgram";
import { cn } from "@/lib/utils";

const pad = (i: number) => String(i + 1).padStart(2, "0");

const applyButton = "btn bg-white text-black border-white hover:bg-gold hover:border-gold hover:text-white";
const outlineLight = "btn border-white text-white hover:bg-white hover:text-black";
const primary = "btn border-black bg-black text-white hover:border-gold hover:bg-gold";
const outline = "btn border-black text-black hover:bg-black hover:text-white";

function Intro({ eyebrow, title, text, className, light }: { eyebrow: string; title: string; text?: string; className?: string; light?: boolean }) {
	return (
		<div className={cn("max-w-2xl space-y-3", className)}>
			<p className={cn("eyebrow", light && "text-sand")}>{eyebrow}</p>
			<h2 className={cn("text-h3 font-display", light && "text-white")}>{title}</h2>
			{text ? <p className={cn("text-sm", light ? "text-sand" : "text-charcoal")}>{text}</p> : null}
		</div>
	);
}

function CtaLink({ cta, className, children }: { cta: Cta; className: string; children?: React.ReactNode }) {
	if (!cta.href) return null;
	return cta.external ? (
		<a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
			{cta.label}
			{children}
		</a>
	) : (
		<Link href={cta.href} className={className}>
			{cta.label}
			{children}
		</Link>
	);
}

/** /majeurs-trade-program/: the live page's sections top to bottom. Copy and images from the page's fields in wp-admin (lib/content/pages/tradeProgram.ts) */
export default async function TradeProgramPage() {
	const c = await getPageContent(tradeProgram);
	return (
		<>
			<PageHero eyebrow={c.heroEyebrow} title={c.heroTitle} image={c.heroImage} size="tall" overlayClassName="bg-black/65" className="lg:min-h-[640px]">
				{paragraphs(c.heroText).map((p) => (
					<p key={p} className="mx-auto max-w-2xl text-sm text-sand">
						{p}
					</p>
				))}
				<div className="flex flex-wrap justify-center gap-3 pt-3">
					<CtaLink cta={c.heroApply} className={applyButton} />
					<CtaLink cta={c.heroDiscuss} className={outlineLight} />
				</div>
			</PageHero>

			{/* key numbers */}
			<section className="bg-black px-2.5 py-10 md:px-5">
				<dl className="container-site grid grid-cols-2 gap-8 lg:grid-cols-4">
					{c.stats.map((s) => (
						<div key={s.value} className="space-y-1">
							<dt className="text-2xl text-white md:text-3xl">{s.value}</dt>
							<dd className="text-xs text-sand">{s.label}</dd>
						</div>
					))}
				</dl>
			</section>

			{/* who it's for */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site space-y-10">
					<Intro eyebrow={c.audiencesEyebrow} title={c.audiencesTitle} text={c.audiencesText} />
					<ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{c.audiences.map((a, i) => (
							<li key={a.title} className="space-y-2 border border-sand p-6">
								<p className="text-xs text-gold-muted">{pad(i)}</p>
								<h3 className="text-lg text-black">{a.title}</h3>
								<p className="text-sm text-charcoal">{a.text}</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* what you get */}
			<section className="bg-sand px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
					<div className="relative aspect-[4/3] overflow-hidden lg:sticky lg:top-28">
						<Image src={c.benefitsImage} alt={c.benefitsImageAlt} fill sizes="(min-width: 1025px) 50vw, 100vw" className="object-cover" />
					</div>
					<div className="space-y-8">
						<Intro eyebrow={c.benefitsEyebrow} title={c.benefitsTitle} text={c.benefitsText} />
						<ol className="divide-y divide-grey/40 border-y border-grey/40">
							{c.benefits.map((b, i) => (
								<li key={b.title} className="grid grid-cols-[2.5rem_1fr] gap-2 py-5">
									<span className="text-xs text-gold-muted">{pad(i)}</span>
									<div className="space-y-1">
										<h3 className="text-base text-black">{b.title}</h3>
										<p className="text-sm text-charcoal">{b.text}</p>
									</div>
								</li>
							))}
						</ol>
					</div>
				</div>
			</section>

			{/* partnership tiers */}
			<section className="bg-black px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site space-y-10">
					<Intro light className="mx-auto text-center" eyebrow={c.tiersEyebrow} title={c.tiersTitle} text={c.tiersText} />
					<ul className="grid gap-4 md:grid-cols-3">
						{c.tiers.map((t) => (
							<li key={t.name} className={cn("space-y-5 border p-6 md:p-8", t.badge ? "border-sand bg-sand text-black" : "border-white/25 text-white")}>
								<p className={cn("text-xs uppercase tracking-button", t.badge ? "text-bronze" : "text-sand")}>
									{t.name}
									{t.badge ? ` · ${t.badge}` : ""}
								</p>
								<div>
									<p className="text-3xl">{t.discount}</p>
									<p className={cn("mt-1 text-xs", t.badge ? "text-charcoal" : "text-sand")}>{t.spend}</p>
								</div>
								<ul className="space-y-2 text-sm">
									{t.perks.map(({ perk }) => (
										<li key={perk} className="flex gap-2">
											<Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
											{perk}
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
					<div className="text-center">
						<CtaLink cta={c.tiersApply} className={applyButton} />
					</div>
				</div>
			</section>

			{/* how it works */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site space-y-10">
					<Intro eyebrow={c.stepsEyebrow} title={c.stepsTitle} />
					<ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{c.steps.map((s, i) => (
							<li key={s.title} className="space-y-3 border-t border-black pt-5">
								<p className="text-4xl font-light text-grey">{pad(i)}</p>
								<h3 className="text-lg text-black">{s.title}</h3>
								<p className="text-sm text-charcoal">{s.text}</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* collections */}
			<section className="bg-sand px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site space-y-10">
					<Intro eyebrow={c.seriesEyebrow} title={c.seriesTitle} text={c.seriesText} />
					<ul className="grid gap-4 md:grid-cols-3">
						{c.series.map((s, i) => (
							<li key={s.title} className="space-y-3 bg-white p-6 md:p-8">
								<p className="text-xs text-gold-muted">{pad(i)}</p>
								<h3 className="text-lg text-black">{s.title}</h3>
								<p className="text-sm text-charcoal">{s.text}</p>
								<div className="border-t border-sand pt-3">
									<p className="text-xs uppercase tracking-button text-black">{c.seriesMaterialsLabel}</p>
									<p className="mt-1 text-sm text-charcoal">{s.materials}</p>
								</div>
							</li>
						))}
					</ul>
					<div className="flex flex-wrap gap-3">
						<CtaLink cta={c.seriesQuote} className={primary} />
						<CtaLink cta={c.seriesBrowse} className={outline} />
					</div>
				</div>
			</section>

			{/* aftercare */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site grid gap-10 lg:grid-cols-[1fr_2fr]">
					<div className="space-y-3">
						<p className="eyebrow">{c.aftercareEyebrow}</p>
						<h2 className="text-h3 font-display">{c.aftercareTitle}</h2>
						{paragraphs(c.aftercareNote).map((p) => (
							<p key={p} className="text-xs text-grey">
								{p}
							</p>
						))}
					</div>
					<ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
						{c.aftercare.map((a) => (
							<li key={a.title} className="space-y-1 border-t border-sand pt-4">
								<h3 className="text-base text-black">{a.title}</h3>
								<p className="text-sm text-charcoal">{a.text}</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* apply */}
			<section id="apply" className="scroll-mt-24 bg-sand-50 px-2.5 py-12.5 md:px-5 md:py-24">
				{/* old WP links point at #tradeProgramForm */}
				<span id="tradeProgramForm" className="block scroll-mt-24" aria-hidden />
				<div className="container-site max-w-3xl space-y-8">
					<Intro eyebrow={c.applyEyebrow} title={c.applyTitle} text={c.applyText} />
					<div className="bg-white p-6 md:p-10">
						<TradeApplyForm />
					</div>
				</div>
			</section>

			{/* FAQs */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site grid gap-10 lg:grid-cols-[1fr_2fr]">
					<div className="space-y-4">
						<p className="eyebrow">{c.faqEyebrow}</p>
						<h2 className="text-h3 font-display">{c.faqTitle}</h2>
						{paragraphs(c.faqText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
						<CtaLink cta={c.faqCta} className={outline} />
					</div>
					<TradeFaq items={c.faqs} />
				</div>
			</section>

			<div className="bg-sand-50">
				<TradeInsights eyebrow={c.insightsEyebrow} title={c.insightsTitle} text={c.insightsText} cta={c.insightsCta} />
			</div>

			{/* closing CTA */}
			<section className="relative isolate overflow-hidden px-2.5 py-20 text-center md:px-5 md:py-28">
				<Image src={c.heroImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
				<div className="absolute inset-0 -z-10 bg-black/75" aria-hidden />
				<div className="mx-auto max-w-xl space-y-4">
					<p className="eyebrow text-sand">{c.closingEyebrow}</p>
					<h2 className="text-h2 font-display text-white">{c.closingTitle}</h2>
					{paragraphs(c.closingText).map((p) => (
						<p key={p} className="text-sm text-sand">
							{p}
						</p>
					))}
					<div className="flex flex-wrap justify-center gap-3 pt-2">
						<CtaLink cta={c.closingApply} className={applyButton} />
						<CtaLink cta={c.closingDiscuss} className={cn(outlineLight, "group")}>
							<MoveRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
						</CtaLink>
					</div>
				</div>
			</section>
		</>
	);
}
