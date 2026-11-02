import Image from "next/image";
import Link from "next/link";
import { Check, Minus, MoveRight, Plus, type LucideIcon } from "lucide-react";
import type { Cta } from "@/lib/content/model";
import { cn } from "@/lib/utils";
import { SectionIntro } from "./splitFeature";

/** Shared landing-page blocks: section shell, check lists, numbered steps, card grids, stats, FAQs, image banner */

const tones = { plain: "", cream: "bg-[#f8f6f2]", sand: "bg-sand" };

type SectionProps = {
	id?: string;
	eyebrow?: string;
	title?: string;
	intro?: React.ReactNode;
	tone?: keyof typeof tones;
	/** narrow column for FAQs and text-led sections */
	narrow?: boolean;
	className?: string;
	children: React.ReactNode;
};

/** Padded, centred section with an optional eyebrow + heading + intro above its content */
export function Section({ id, eyebrow, title, intro, tone = "plain", narrow, className, children }: SectionProps) {
	return (
		<section id={id} className={cn("scroll-mt-28 px-2.5 py-12.5 md:px-5 md:py-20", tones[tone], className)}>
			<div className={cn("container-site space-y-10 md:space-y-14", narrow && "max-w-[860px]")}>
				{title ? (
					<SectionIntro eyebrow={eyebrow} title={title}>
						{intro}
					</SectionIntro>
				) : null}
				{children}
			</div>
		</section>
	);
}

/** Text link with a sliding arrow, for "Read the …" links under cards and sections */
export function ArrowLink({ cta, className }: { cta: Cta; className?: string }) {
	if (!cta.href) return null;
	const content = (
		<>
			{cta.label}
			<MoveRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-1" aria-hidden />
		</>
	);
	const cls = cn("group inline-flex items-center gap-2 text-sm text-black underline-offset-4 hover:text-gold hover:underline", className);
	return cta.external ? (
		<a href={cta.href} target="_blank" rel="noopener noreferrer" className={cls}>
			{content}
		</a>
	) : (
		<Link href={cta.href} className={cls}>
			{content}
		</Link>
	);
}

export function CheckList({
	items,
	icon: Icon = Check,
	iconClassName = "text-gold",
	className,
}: {
	items: string[];
	icon?: LucideIcon;
	iconClassName?: string;
	className?: string;
}) {
	return (
		<ul className={cn("space-y-2 text-sm text-black", className)}>
			{items.map((item) => (
				<li key={item} className="flex gap-2.5">
					<Icon className={cn("mt-0.5 size-4 shrink-0", iconClassName)} strokeWidth={1.5} aria-hidden />
					{item}
				</li>
			))}
		</ul>
	);
}

/** "01 Share your brief …" row: 2 columns on tablets, 4 on desktop */
export function NumberedSteps({ steps }: { steps: { title: string; text: string }[] }) {
	return (
		<ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
			{steps.map((step, i) => (
				<li key={step.title} className="space-y-3 border-t border-black pt-5">
					<p className="font-display text-2xl tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</p>
					<h3 className="text-base text-black">{step.title}</h3>
					<p className="text-sm text-charcoal">{step.text}</p>
				</li>
			))}
		</ol>
	);
}

export type FeatureCardData = {
	title: string;
	text?: string;
	/** small line under the title, e.g. a price or who it's for */
	subtitle?: string;
	icon?: LucideIcon;
	image?: string;
	points?: string[];
	/** icon for the points; a check by default */
	pointIcon?: LucideIcon;
	cta?: Cta;
	/** a button instead of the arrow link */
	action?: React.ReactNode;
};

/** Grid of bordered cards (icon or image, title, text, check list, link). `columns` is the desktop count. */
export function FeatureCards({ cards, columns = 3, className }: { cards: FeatureCardData[]; columns?: 2 | 3; className?: string }) {
	return (
		<ul className={cn("grid gap-5 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3", className)}>
			{cards.map(({ title, text, subtitle, icon: Icon, image, points, pointIcon, cta, action }) => (
				<li key={title} className="flex flex-col border border-sand bg-white">
					{image ? (
						<div className="relative aspect-[3/2] overflow-hidden bg-sand-50">
							<Image src={image} alt="" fill sizes="(min-width: 1025px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
						</div>
					) : null}
					<div className="flex flex-1 flex-col gap-5 p-6 md:p-8">
						{Icon ? <Icon className="size-7 text-gold" strokeWidth={1.5} aria-hidden /> : null}
						<div className="space-y-2">
							<h3 className="text-lg text-black">{title}</h3>
							{subtitle ? <p className="text-xs uppercase tracking-button text-gold-muted">{subtitle}</p> : null}
							{text ? <p className="text-sm text-charcoal">{text}</p> : null}
						</div>
						{points?.length ? <CheckList items={points} icon={pointIcon} iconClassName={pointIcon ? "text-charcoal" : undefined} /> : null}
						{action || cta?.href ? <div className="mt-auto pt-2">{action ?? (cta ? <ArrowLink cta={cta} /> : null)}</div> : null}
					</div>
				</li>
			))}
		</ul>
	);
}

/** Big figures with labels under them ("4300+ Pieces restored") */
export function StatList({ stats, className }: { stats: { value: string; label: string }[]; className?: string }) {
	return (
		<dl className={cn("grid grid-cols-2 gap-y-10 text-center md:grid-cols-4", className)}>
			{stats.map((s) => (
				<div key={s.label} className="flex flex-col-reverse gap-2">
					<dt className="text-xs uppercase tracking-button text-charcoal">{s.label}</dt>
					<dd className="text-h2 tabular-nums text-black">{s.value}</dd>
				</div>
			))}
		</dl>
	);
}

/** Accordion of questions, plus the FAQPage JSON-LD so they can show in search results */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
	if (!items.length) return null;
	const schema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
	};
	return (
		<div className="space-y-2">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
			{items.map((f, i) => (
				<details key={f.q} open={i === 0} className="group border border-sand bg-white">
					<summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 text-black [&::-webkit-details-marker]:hidden">
						<Plus className="size-4 shrink-0 group-open:hidden" aria-hidden />
						<Minus className="hidden size-4 shrink-0 group-open:block" aria-hidden />
						<h3 className="text-sm md:text-base">{f.q}</h3>
					</summary>
					<p className="border-t border-sand px-4 py-4 text-sm text-charcoal">{f.a}</p>
				</details>
			))}
		</div>
	);
}

/** Full-width photo band with a dark overlay and centred heading, text and buttons */
export function ImageBanner({ image, eyebrow, title, text, children }: { image: string; eyebrow?: string; title: string; text?: string; children?: React.ReactNode }) {
	return (
		<section className="relative isolate overflow-hidden px-2.5 py-20 text-center md:px-5 md:py-28">
			<Image src={image} alt="" fill sizes="100vw" className="-z-20 object-cover" />
			<div className="absolute inset-0 -z-10 bg-black/65" aria-hidden />
			<div className="mx-auto max-w-xl space-y-4">
				{eyebrow ? <p className="text-xs uppercase tracking-eyebrow text-sand">{eyebrow}</p> : null}
				<h2 className="font-display text-h3 text-white">{title}</h2>
				{text ? <p className="text-sm text-sand">{text}</p> : null}
				{children ? <div className="flex flex-wrap items-center justify-center gap-3 pt-2">{children}</div> : null}
			</div>
		</section>
	);
}
