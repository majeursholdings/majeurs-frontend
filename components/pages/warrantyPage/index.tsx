import Link from "next/link";
import { Check, MoveRight, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { getPageContent } from "@/lib/content/get";
import { paragraphs, type Cta } from "@/lib/content/model";
import { warranty } from "@/lib/content/pages/warranty";
import { cn } from "@/lib/utils";

const CREAM = "bg-[#f4f1ea]";
const PHONE = "0814 399 8290";
const TEL = "tel:+2348143998290";
const EMAIL = "customerservice@majeursholdings.com";

// same prefilled messages as the live page
const claimWhatsapp =
	"https://wa.me/2348143998290?text=" +
	encodeURIComponent("Hello Majeurs, I'd like to make a warranty claim.\n\nName:\nOrder/invoice reference:\nProduct:\nDelivery/installation date:\nIssue:\n\n(I'll attach photos or a short video.)");
const claimEmail =
	`mailto:${EMAIL}?subject=${encodeURIComponent("Warranty claim")}&body=` +
	encodeURIComponent("Name:\nOrder/invoice reference:\nProduct:\nDelivery/installation date:\nDescription of the issue:\n\n(Photos or a short video attached)");

const channels = [
	{ label: "WhatsApp", value: PHONE, href: claimWhatsapp, external: true },
	{ label: "Phone", value: PHONE, href: TEL },
	{ label: "Email", value: EMAIL, href: claimEmail },
	{
		label: "Showroom",
		value: "32 QMB Builder’s Mart Rd, Eti-Osa, Lekki 106104, Lagos",
		href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("32 QMB Builders Mart Road, Lekki Phase 1, Lagos"),
		external: true,
	},
];

function Eyebrow({ children }: { children: React.ReactNode }) {
	return <p className="eyebrow">{children}</p>;
}

function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
	return (
		<section id={id} className={cn("scroll-mt-28 px-2.5 py-14 md:px-5 md:py-20", className)}>
			<div className="container-site max-w-[1000px]">{children}</div>
		</section>
	);
}

/** Two-column table (coverage, outcomes) with the WP header row and striped body */
function Table({ head, rows }: { head: [string, string]; rows: string[][] }) {
	return (
		<div className="overflow-x-auto border border-sand">
			<table className="w-full min-w-[480px] text-left text-sm">
				<thead className="border-b border-sand bg-white text-xs uppercase tracking-button text-black">
					<tr>
						<th scope="col" className="w-1/3 px-5 py-4 font-normal md:w-2/5">
							{head[0]}
						</th>
						<th scope="col" className="border-l border-sand px-5 py-4 font-normal">
							{head[1]}
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(([a, b]) => (
						<tr key={a} className="border-b border-sand bg-white last:border-0 odd:bg-[#f4f1ea]">
							<th scope="row" className="px-5 py-4 font-normal text-ink">
								{a}
							</th>
							<td className="border-l border-sand px-5 py-4 text-black">{b}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function CheckList({ items, icon = "check" }: { items: { text: string }[]; icon?: "check" | "x" }) {
	const Icon = icon === "check" ? Check : X;
	return (
		<ul className="divide-y divide-sand border-b border-sand">
			{items.map(({ text }) => (
				<li key={text} className="flex gap-3 py-3 text-sm text-charcoal">
					<Icon className={cn("mt-0.5 size-4 shrink-0", icon === "check" ? "text-gold" : "text-charcoal")} aria-hidden />
					{text}
				</li>
			))}
		</ul>
	);
}

/** Text link with the sliding arrow (repair service, other policies) */
function ArrowLink({ cta, className }: { cta: Cta; className: string }) {
	if (!cta.href) return null;
	return (
		<Link href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noopener noreferrer" : undefined} className={className}>
			{cta.label}
			<MoveRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
		</Link>
	);
}

/** /warranty-policy/: the 12-month warranty, what's covered and excluded, how to claim and what happens next. Copy from the page's fields in wp-admin (lib/content/pages/warranty.ts) */
export default async function WarrantyPage() {
	const c = await getPageContent(warranty);
	return (
		<>
			{/* Hero: jump links + summary cards */}
			<section className={cn(CREAM, "px-2.5 pb-16 pt-14 md:px-5 md:pb-20 md:pt-20")}>
				<div className="container-site max-w-[1000px] space-y-10 text-center">
					<div className="mx-auto max-w-2xl space-y-5">
						<Eyebrow>{c.heroEyebrow}</Eyebrow>
						<h1 className="text-h2 font-normal text-black">{c.heroTitle}</h1>
						{paragraphs(c.heroText).map((p) => (
							<p key={p} className="text-sm text-charcoal md:text-base">
								{p}
							</p>
						))}
					</div>
					<nav aria-label="On this page">
						<ul className="flex flex-wrap justify-center gap-2">
							{c.chips.map(({ cta }) => (
								<li key={cta.href}>
									<a href={cta.href} className="inline-block border border-black px-4 py-2 text-xs text-black transition-colors hover:bg-black hover:text-white">
										{cta.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
					<ul className="mx-auto grid max-w-3xl gap-4 text-left md:grid-cols-3">
						{c.summary.map((s) => (
							<li key={s.title} className="space-y-2 bg-white p-5">
								<p className="text-sm text-black">{s.title}</p>
								<p className="text-xs text-grey">{s.text}</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Coverage */}
			<Section id="coverage">
				<div className="space-y-6">
					<div className="space-y-3">
						<Eyebrow>{c.coverageEyebrow}</Eyebrow>
						<h2 className="text-h3 font-normal">{c.coverageTitle}</h2>
						{paragraphs(c.coverageText).map((p) => (
							<p key={p} className="max-w-2xl text-sm text-charcoal">
								{p}
							</p>
						))}
					</div>
					<Table head={[c.coverageHeadPart, c.coverageHeadCover]} rows={c.coverage.map((r) => [r.part, r.cover])} />
					{paragraphs(c.coverageNote).map((p) => (
						<p key={p} className="text-xs text-grey">
							{p}
						</p>
					))}
					{paragraphs(c.coveragePests).map((p) => (
						<p key={p} className="border-l-2 border-gold pl-4 text-xs text-grey">
							{p}
						</p>
					))}
				</div>
			</Section>

			{/* Eligibility / exclusions */}
			<Section id="exclusions" className={CREAM}>
				<div className="grid gap-12 md:grid-cols-2">
					<div className="space-y-5">
						<div className="space-y-3">
							<Eyebrow>{c.validEyebrow}</Eyebrow>
							<h2 className="text-h3 font-normal">{c.validTitle}</h2>
						</div>
						<CheckList items={c.valid} />
						<div className="text-xs text-grey [&_a]:text-black [&_a]:underline [&_a]:underline-offset-2" dangerouslySetInnerHTML={{ __html: c.validNote }} />
					</div>
					<div className="space-y-5">
						<div className="space-y-3">
							<Eyebrow>{c.excludedEyebrow}</Eyebrow>
							<h2 className="text-h3 font-normal">{c.excludedTitle}</h2>
						</div>
						<CheckList items={c.excluded} icon="x" />
					</div>
				</div>
			</Section>

			{/* Make a claim */}
			<Section id="claim">
				<div className="space-y-10">
					<div className="space-y-3">
						<Eyebrow>{c.claimEyebrow}</Eyebrow>
						<h2 className="text-h3 font-normal">{c.claimTitle}</h2>
						{paragraphs(c.claimText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
					</div>
					<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{channels.map((ch) => (
							<li key={ch.label}>
								<a
									href={ch.href}
									{...(ch.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
									className="block h-full space-y-2 border border-black p-4 transition-colors hover:bg-black hover:text-white"
								>
									<span className="block text-xs uppercase tracking-button">{ch.label}</span>
									<span className="block text-sm [overflow-wrap:anywhere]">{ch.value}</span>
								</a>
							</li>
						))}
					</ul>
					<div className="space-y-4">
						<h3 className="text-h4 font-normal">{c.readyTitle}</h3>
						<CheckList items={c.ready} />
					</div>
				</div>
			</Section>

			{/* Process */}
			<Section id="process" className={CREAM}>
				<div className="space-y-10">
					<div className="space-y-3">
						<Eyebrow>{c.processEyebrow}</Eyebrow>
						<h2 className="text-h3 font-normal">{c.processTitle}</h2>
					</div>
					<ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{c.steps.map((s, i) => (
							<li key={s.title} className="space-y-3 bg-white p-6">
								<span className="block text-xs text-grey">{String(i + 1).padStart(2, "0")}</span>
								<h3 className="text-lg font-normal text-black">{s.title}</h3>
								<p className="text-xs text-grey">{s.text}</p>
							</li>
						))}
					</ol>
					<div className="space-y-4">
						<h3 className="text-h4 font-normal">{c.outcomesTitle}</h3>
						<Table head={[c.outcomesHeadOutcome, c.outcomesHeadResult]} rows={c.outcomes.map((r) => [r.outcome, r.result])} />
					</div>
				</div>
			</Section>

			{/* Beyond the warranty / certificate */}
			<Section>
				<div className="grid gap-12 md:grid-cols-2">
					<div className="space-y-4">
						<Eyebrow>{c.beyondEyebrow}</Eyebrow>
						<h2 className="text-h3 font-normal">{c.beyondTitle}</h2>
						{paragraphs(c.beyondText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
						<CheckList items={c.beyond} />
						<ArrowLink cta={c.beyondCta} className="group inline-flex items-center gap-2 text-xs text-black hover:text-gold" />
					</div>
					<div className="space-y-4">
						<Eyebrow>{c.certificateEyebrow}</Eyebrow>
						<h2 className="text-h3 font-normal">{c.certificateTitle}</h2>
						{paragraphs(c.certificateText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
						<div className="flex flex-wrap gap-6 text-xs">
							{c.policies.map(({ cta }) => (
								<ArrowLink key={cta.href} cta={cta} className="group inline-flex items-center gap-2 text-black hover:text-gold" />
							))}
						</div>
					</div>
				</div>
			</Section>

			{/* Closing CTA */}
			<section className="bg-black px-2.5 py-16 text-center md:px-5 md:py-24">
				<div className="mx-auto max-w-2xl space-y-5">
					<h2 className="text-h3 font-normal text-white">{c.closingTitle}</h2>
					{paragraphs(c.closingText).map((p) => (
						<p key={p} className="text-sm text-sand">
							{p}
						</p>
					))}
					<div className="flex flex-wrap justify-center gap-3 pt-2">
						<a href={claimWhatsapp} target="_blank" rel="noopener noreferrer" className="btn border-white bg-white text-black hover:border-gold hover:bg-gold hover:text-white">
							<BrandIcon name="whatsapp" className="size-4" />
							{c.closingWhatsapp}
						</a>
						<a href={TEL} className="btn border-white text-white hover:bg-white hover:text-black">
							{c.closingCall} {PHONE}
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
