import Image from "next/image";
import Link from "next/link";
import { Check, HeartHandshake, MoveRight, ShieldCheck, SwatchBook, type LucideIcon } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { BrandIcon } from "@/components/common/brandIcons";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { SectionIntro, SplitFeature } from "@/components/landing/splitFeature";
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

	const assurances: { icon: LucideIcon; title: string; text: string; points: { text: string }[]; cta: typeof c.warrantyCta }[] = [
		{ icon: ShieldCheck, title: c.warrantyTitle, text: c.warrantyText, points: c.warrantyPoints, cta: c.warrantyCta },
		{ icon: SwatchBook, title: c.materialsTitle, text: c.materialsText, points: c.materialsPoints, cta: c.materialsCta },
		{ icon: HeartHandshake, title: c.careTitle, text: c.careText, points: c.carePoints, cta: c.careCta },
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
						<QuoteButton {...quote} className="border-black bg-black text-white hover:border-gold hover:bg-gold" />
						{c.whatsappLabel ? (
							<a
								href={whatsappLink(c.whatsappMessage || undefined)}
								target="_blank"
								rel="noopener noreferrer"
								className="btn border-black text-black hover:bg-black hover:text-white"
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

			<section className="bg-[#f8f6f2] px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10 md:space-y-14">
					<SectionIntro eyebrow={c.stepsEyebrow} title={c.stepsTitle} />
					<ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
						{c.steps.map((step, i) => (
							<li key={step.title} className="space-y-3 border-t border-black pt-5">
								<p className="font-display text-2xl tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</p>
								<h3 className="text-base text-black">{step.title}</h3>
								<p className="text-sm text-charcoal">{step.text}</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10 md:space-y-14">
					<SectionIntro eyebrow={c.assuranceEyebrow} title={c.assuranceTitle} />
					<ul className="grid gap-5 md:grid-cols-3">
						{assurances.map(({ icon: Icon, title, text, points, cta }) => (
							<li key={title} className="flex flex-col gap-5 border border-sand p-6 md:p-8">
								<Icon className="size-7 text-gold" strokeWidth={1.5} aria-hidden />
								<div className="space-y-2">
									<h3 className="text-lg text-black">{title}</h3>
									<p className="text-sm text-charcoal">{text}</p>
								</div>
								<ul className="space-y-2">
									{points.map((p) => (
										<li key={p.text} className="flex gap-2.5 text-sm text-black">
											<Check className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
											{p.text}
										</li>
									))}
								</ul>
								{cta.href ? (
									<Link href={cta.href} className="group mt-auto inline-flex items-center gap-2 pt-2 text-sm text-black underline-offset-4 hover:text-gold hover:underline">
										{cta.label}
										<MoveRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-1" aria-hidden />
									</Link>
								) : null}
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="relative isolate overflow-hidden px-2.5 py-20 text-center md:px-5 md:py-28">
				<Image src={c.closingImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
				<div className="absolute inset-0 -z-10 bg-black/60" aria-hidden />
				<div className="mx-auto max-w-xl space-y-4">
					<h2 className="font-display text-h3 text-white">{c.closingTitle}</h2>
					<p className="text-sm text-sand">{c.closingText}</p>
					<QuoteButton {...quote} className="mt-2 border-white bg-white text-black hover:border-gold hover:bg-gold hover:text-white" />
				</div>
			</section>
		</>
	);
}
