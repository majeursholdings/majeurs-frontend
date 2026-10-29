import Link from "next/link";
import { Check, MoveRight, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
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

const chips = [
	{ label: "What’s covered", href: "#coverage" },
	{ label: "What’s not covered", href: "#exclusions" },
	{ label: "Make a claim", href: "#claim" },
	{ label: "What happens next", href: "#process" },
];

const summary = [
	{ title: "12 months", text: "From the date of delivery or installation." },
	{ title: "Faults, materials, workmanship", text: "Covers manufacturing faults, material defects and workmanship issues." },
	{ title: "Repair or replacement", text: "Valid claims are repaired, or parts or the piece replaced." },
];

const coverage = [
	["Furniture structure (frame and joinery)", "12 months"],
	["Upholstery stitching", "6 months"],
	["Hardware (hinges, runners, fittings)", "Manufacturer’s warranty, up to 12 months where applicable"],
	["Finishes and coatings", "Limited warranty, up to 12 months where applicable"],
];

const valid = [
	"The defect appeared within the 12-month warranty period.",
	"The Majeurs tag is still on the piece.",
	"The defect comes from a manufacturing or material failure.",
	"The piece has been used and cared for under normal conditions.",
];

const excluded = [
	"Accidental damage",
	"Misuse or abuse",
	"Modifications or repairs by third parties",
	"Improper handling after delivery",
	"Exposure to extreme conditions, such as water, fire or excessive weight",
	"Normal wear and tear",
	"Pest exposure or infestation after the first 12 months",
];

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

const haveReady = [
	"Your name and order or invoice reference",
	"A description of the product and the issue",
	"The delivery or installation date",
	"Photos or a short video of the issue",
];

const steps = [
	{ title: "Claim logged", text: "We record your request and confirm that we’ve received it." },
	{ title: "Initial review", text: "We check that the claim is within the warranty period and appears to be manufacturing-related." },
	{ title: "Inspection", text: "Our team assesses the piece by photo review, a remote technical assessment or a site visit to find the root cause." },
	{ title: "Decision", text: "We share what we found, our decision and the next steps." },
	{ title: "Resolution", text: "Approved claims are resolved by repair, component replacement or, in extreme cases, full product replacement, within agreed timelines." },
	{ title: "Case closed", text: "Once the repair or replacement is complete, we close the case and keep the outcome on file." },
];

const outcomes = [
	["Valid claim", "Repair or replacement approved"],
	["Partially valid", "Partial repair support"],
	["Not valid", "Claim declined, with an explanation"],
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

function CheckList({ items, icon = "check" }: { items: string[]; icon?: "check" | "x" }) {
	const Icon = icon === "check" ? Check : X;
	return (
		<ul className="divide-y divide-sand border-b border-sand">
			{items.map((item) => (
				<li key={item} className="flex gap-3 py-3 text-sm text-charcoal">
					<Icon className={cn("mt-0.5 size-4 shrink-0", icon === "check" ? "text-gold" : "text-charcoal")} aria-hidden />
					{item}
				</li>
			))}
		</ul>
	);
}

/** /warranty-policy/: the 12-month warranty, what's covered and excluded, how to claim and what happens next */
export default function WarrantyPage() {
	return (
		<>
			{/* Hero: jump links + summary cards */}
			<section className={cn(CREAM, "px-2.5 pb-16 pt-14 md:px-5 md:pb-20 md:pt-20")}>
				<div className="container-site max-w-[1000px] space-y-10 text-center">
					<div className="mx-auto max-w-2xl space-y-5">
						<Eyebrow>Warranty &amp; after-sales support</Eyebrow>
						<h1 className="text-h2 font-normal text-black">A 12-month warranty on every Majeurs piece</h1>
						<p className="text-sm text-charcoal md:text-base">
							Every piece is handcrafted to last. If something goes wrong because of how it was made, we’ll make it right. Your warranty runs for 12
							months from the day your furniture is delivered or installed.
						</p>
					</div>
					<nav aria-label="On this page">
						<ul className="flex flex-wrap justify-center gap-2">
							{chips.map((c) => (
								<li key={c.href}>
									<a href={c.href} className="inline-block border border-black px-4 py-2 text-xs text-black transition-colors hover:bg-black hover:text-white">
										{c.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
					<ul className="mx-auto grid max-w-3xl gap-4 text-left md:grid-cols-3">
						{summary.map((s) => (
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
						<Eyebrow>Coverage</Eyebrow>
						<h2 className="text-h3 font-normal">What your warranty covers</h2>
						<p className="max-w-2xl text-sm text-charcoal">
							Majeurs provides warranty support for defects caused by manufacturing faults, material defects or workmanship issues. Coverage depends
							on the part of the piece:
						</p>
					</div>
					<Table head={["Part", "Warranty coverage"]} rows={coverage} />
					<p className="text-xs text-grey">
						Where a component carries its own manufacturer’s warranty, that warranty applies within the 12-month period. Your exact start and expiry
						dates are on your warranty certificate.
					</p>
					<p className="border-l-2 border-gold pl-4 text-xs text-grey">
						Every Majeurs piece is treated against pests before delivery. To protect your furniture, avoid prolonged exposure to pests, as long-term
						exposure can cause lasting damage.
					</p>
				</div>
			</Section>

			{/* Eligibility / exclusions */}
			<Section id="exclusions" className={CREAM}>
				<div className="grid gap-12 md:grid-cols-2">
					<div className="space-y-5">
						<div className="space-y-3">
							<Eyebrow>Eligibility</Eyebrow>
							<h2 className="text-h3 font-normal">When a claim is valid</h2>
						</div>
						<CheckList items={valid} />
						<p className="text-xs text-grey">
							Keep the Majeurs tag attached and follow our{" "}
							<Link href="/materials-and-care/" className="text-black underline underline-offset-2">
								material &amp; care guide
							</Link>{" "}
							to keep your warranty valid.
						</p>
					</div>
					<div className="space-y-5">
						<div className="space-y-3">
							<Eyebrow>Exclusions</Eyebrow>
							<h2 className="text-h3 font-normal">What’s not covered</h2>
						</div>
						<CheckList items={excluded} icon="x" />
					</div>
				</div>
			</Section>

			{/* Make a claim */}
			<Section id="claim">
				<div className="space-y-10">
					<div className="space-y-3">
						<Eyebrow>Make a claim</Eyebrow>
						<h2 className="text-h3 font-normal">How to make a warranty claim</h2>
						<p className="text-sm text-charcoal">Contact us through any of these channels:</p>
					</div>
					<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{channels.map((c) => (
							<li key={c.label}>
								<a
									href={c.href}
									{...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
									className="block h-full space-y-2 border border-black p-4 transition-colors hover:bg-black hover:text-white"
								>
									<span className="block text-xs uppercase tracking-button">{c.label}</span>
									<span className="block text-sm [overflow-wrap:anywhere]">{c.value}</span>
								</a>
							</li>
						))}
					</ul>
					<div className="space-y-4">
						<h3 className="text-h4 font-normal">Have these ready</h3>
						<CheckList items={haveReady} />
					</div>
				</div>
			</Section>

			{/* Process */}
			<Section id="process" className={CREAM}>
				<div className="space-y-10">
					<div className="space-y-3">
						<Eyebrow>The process</Eyebrow>
						<h2 className="text-h3 font-normal">What happens after you make a claim</h2>
					</div>
					<ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{steps.map((s, i) => (
							<li key={s.title} className="space-y-3 bg-white p-6">
								<span className="block text-xs text-grey">{String(i + 1).padStart(2, "0")}</span>
								<h3 className="text-lg font-normal text-black">{s.title}</h3>
								<p className="text-xs text-grey">{s.text}</p>
							</li>
						))}
					</ol>
					<div className="space-y-4">
						<h3 className="text-h4 font-normal">Possible outcomes</h3>
						<Table head={["Outcome", "What happens"]} rows={outcomes} />
					</div>
				</div>
			</Section>

			{/* Beyond the warranty / certificate */}
			<Section>
				<div className="grid gap-12 md:grid-cols-2">
					<div className="space-y-4">
						<Eyebrow>Beyond your warranty</Eyebrow>
						<h2 className="text-h3 font-normal">Support that doesn’t expire</h2>
						<p className="text-sm text-charcoal">Even when an issue falls outside your warranty, we’re here to help with:</p>
						<CheckList items={["Paid repair services", "Replacement components", "Technical advice"]} />
						<Link href="/furniture-care-service/" className="group inline-flex items-center gap-2 text-xs text-black hover:text-gold">
							Furniture repair &amp; restoration
							<MoveRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
						</Link>
					</div>
					<div className="space-y-4">
						<Eyebrow>Your certificate</Eyebrow>
						<h2 className="text-h3 font-normal">Your warranty certificate</h2>
						<p className="text-sm text-charcoal">
							You receive a warranty certificate once payment is complete. It forms part of your purchase agreement and records your warranty start
							and expiry dates, so please keep it for the length of your warranty.
						</p>
						<p className="text-sm text-charcoal">For order changes, cancellations, refunds or delivery timelines, see our other policies:</p>
						<div className="flex flex-wrap gap-6 text-xs">
							<Link href="/refund_returns/" className="group inline-flex items-center gap-2 text-black hover:text-gold">
								Refund &amp; returns policy <MoveRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
							</Link>
							<Link href="/shipping-policy/" className="group inline-flex items-center gap-2 text-black hover:text-gold">
								Shipping policy <MoveRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
							</Link>
						</div>
					</div>
				</div>
			</Section>

			{/* Closing CTA */}
			<section className="bg-black px-2.5 py-16 text-center md:px-5 md:py-24">
				<div className="mx-auto max-w-2xl space-y-5">
					<h2 className="text-h3 font-normal text-white">Something not right with your piece?</h2>
					<p className="text-sm text-sand">Send us your order reference and a few photos, and we’ll take it from there.</p>
					<div className="flex flex-wrap justify-center gap-3 pt-2">
						<a href={claimWhatsapp} target="_blank" rel="noopener noreferrer" className="btn border-white bg-white text-black hover:border-gold hover:bg-gold hover:text-white">
							<BrandIcon name="whatsapp" className="size-4" />
							Start a claim on WhatsApp
						</a>
						<a href={TEL} className="btn border-white text-white hover:bg-white hover:text-black">
							Call {PHONE}
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
