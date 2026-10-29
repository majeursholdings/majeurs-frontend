import Image from "next/image";
import Link from "next/link";
import { Check, MoveRight } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { TradeApplyForm } from "./applyForm";
import { aftercare, audiences, benefits, QUOTE_PATH, series, stats, steps, tiers, UPLOADS } from "./content";
import { TradeFaq } from "./faq";
import { TradeInsights } from "./insights";
import { cn } from "@/lib/utils";

const HERO = `${UPLOADS}/majeurs-trade-programme-bespoke-furniture-specification.webp`;
const WORKSHOP = `${UPLOADS}/Looking-for-a-furniture-manufacturer-to-help-bring-your-interior-design-ideas-to-life.webp`;

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

/** /majeurs-trade-program/: the live page's sections top to bottom */
export default function TradeProgramPage() {
	return (
		<>
			<PageHero
				eyebrow="The Majeurs Trade Program"
				title="For Professionals Who Specify Furniture, Not Just Select It"
				image={HERO}
				size="tall"
				overlayClassName="bg-black/65"
				className="lg:min-h-[640px]"
			>
				<p className="mx-auto max-w-2xl text-sm text-sand">
					Architects, interior designers, property developers, hoteliers and procurement teams: this is built for you. Work directly with the
					manufacturer behind the furniture, with custom dimensions, material and finish flexibility, coordinated production, a dedicated point
					of contact and trade discounts of up to 20%.
				</p>
				<div className="flex flex-wrap justify-center gap-3 pt-3">
					<Link href="#apply" className={applyButton}>
						Apply for trade access
					</Link>
					<Link href={QUOTE_PATH} className={outlineLight}>
						Discuss your project
					</Link>
				</div>
			</PageHero>

			{/* key numbers */}
			<section className="bg-black px-2.5 py-10 md:px-5">
				<dl className="container-site grid grid-cols-2 gap-8 lg:grid-cols-4">
					{stats.map((s) => (
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
					<Intro
						eyebrow="Who it’s for"
						title="Built for the people who specify"
						text="If your work involves choosing furniture for clients, buildings or guests, the Trade Program gives you manufacturer access without the retail middle step."
					/>
					<ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{audiences.map((a, i) => (
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
						<Image src={WORKSHOP} alt="An interior designer reviewing material samples with Majeurs" fill sizes="(min-width: 1025px) 50vw, 100vw" className="object-cover" />
					</div>
					<div className="space-y-8">
						<Intro
							eyebrow="What you get"
							title="A direct line to the workshop"
							text="Trade members work with the people who actually make the furniture, so decisions happen faster and nothing gets lost between specification and delivery."
						/>
						<ol className="divide-y divide-grey/40 border-y border-grey/40">
							{benefits.map((b, i) => (
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
					<Intro
						light
						className="mx-auto text-center"
						eyebrow="Partnership tiers"
						title="Rewards that grow with your projects"
						text="Your tier is set by your cumulative annual spend with Majeurs. Every tier includes a dedicated contact and full access to the Trade Program."
					/>
					<ul className="grid gap-4 md:grid-cols-3">
						{tiers.map((t) => (
							<li key={t.name} className={cn("space-y-5 border p-6 md:p-8", t.featured ? "border-sand bg-sand text-black" : "border-white/25 text-white")}>
								<p className={cn("text-xs uppercase tracking-button", t.featured ? "text-bronze" : "text-sand")}>
									{t.name}
									{t.badge ? ` · ${t.badge}` : ""}
								</p>
								<div>
									<p className="text-3xl">{t.discount}</p>
									<p className={cn("mt-1 text-xs", t.featured ? "text-charcoal" : "text-sand")}>{t.spend}</p>
								</div>
								<ul className="space-y-2 text-sm">
									{t.perks.map((perk) => (
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
						<Link href="#apply" className={applyButton}>
							Apply for trade access
						</Link>
					</div>
				</div>
			</section>

			{/* how it works */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site space-y-10">
					<Intro eyebrow="How it works" title="From application to installation" />
					<ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{steps.map((s, i) => (
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
					<Intro
						eyebrow="Collections for every brief"
						title="Three series, one standard of make"
						text="Whether you are furnishing a serviced-apartment block or a single statement suite, every piece is made in our Lagos workshop to the same standard."
					/>
					<ul className="grid gap-4 md:grid-cols-3">
						{series.map((s, i) => (
							<li key={s.title} className="space-y-3 bg-white p-6 md:p-8">
								<p className="text-xs text-gold-muted">{pad(i)}</p>
								<h3 className="text-lg text-black">{s.title}</h3>
								<p className="text-sm text-charcoal">{s.text}</p>
								<div className="border-t border-sand pt-3">
									<p className="text-xs uppercase tracking-button text-black">Materials</p>
									<p className="mt-1 text-sm text-charcoal">{s.materials}</p>
								</div>
							</li>
						))}
					</ul>
					<div className="flex flex-wrap gap-3">
						<Link href={QUOTE_PATH} className={primary}>
							Request a project quote
						</Link>
						<Link href="/shop/" className={outline}>
							Browse the catalogue
						</Link>
					</div>
				</div>
			</section>

			{/* aftercare */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site grid gap-10 lg:grid-cols-[1fr_2fr]">
					<div className="space-y-3">
						<p className="eyebrow">Aftercare</p>
						<h2 className="text-h3 font-display">Built to last, and backed when it matters</h2>
						<p className="text-xs text-grey">Warranty excludes damage from misuse, pets, spills or unauthorised modifications.</p>
					</div>
					<ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
						{aftercare.map((a) => (
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
					<Intro
						eyebrow="Apply"
						title="Apply for trade access"
						text="Have your company details and business licence ready (image or PDF, up to 5MB). Our team reviews every application, and a member of the Majeurs team will contact you directly."
					/>
					<div className="bg-white p-6 md:p-10">
						<TradeApplyForm />
					</div>
				</div>
			</section>

			{/* FAQs */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site grid gap-10 lg:grid-cols-[1fr_2fr]">
					<div className="space-y-4">
						<p className="eyebrow">FAQs</p>
						<h2 className="text-h3 font-display">Questions from the trade</h2>
						<p className="text-sm text-charcoal">Can’t find what you need? Talk to us about your project.</p>
						<Link href={QUOTE_PATH} className={outline}>
							Discuss your project
						</Link>
					</div>
					<TradeFaq />
				</div>
			</section>

			<div className="bg-sand-50">
				<TradeInsights />
			</div>

			{/* closing CTA */}
			<section className="relative isolate overflow-hidden px-2.5 py-20 text-center md:px-5 md:py-28">
				<Image src={HERO} alt="" fill sizes="100vw" className="-z-20 object-cover" />
				<div className="absolute inset-0 -z-10 bg-black/75" aria-hidden />
				<div className="mx-auto max-w-xl space-y-4">
					<p className="eyebrow text-sand">Ready when you are</p>
					<h2 className="text-h2 font-display text-white">Have a project on the table?</h2>
					<p className="text-sm text-sand">Tell us what you are working on and we will come back with options, samples and a plan.</p>
					<div className="flex flex-wrap justify-center gap-3 pt-2">
						<Link href="#apply" className={applyButton}>
							Apply for trade access
						</Link>
						<Link href={QUOTE_PATH} className={cn(outlineLight, "group")}>
							Discuss your project
							<MoveRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
