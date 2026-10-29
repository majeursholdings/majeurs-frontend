import Link from "next/link";
import { BadgeCheck, Check, ChevronDown, Lock, Mail, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { BrandIcon, type BrandIconName } from "@/components/common/brandIcons";
import type { ProductDetail } from "@/lib/api/product";

/** "12-month warranty" card under the buy buttons (WP mj-warranty-badge snippet) */
export function WarrantyCard() {
	return (
		<div className="flex gap-3 border border-sand bg-[#f8f6f2] p-4 md:p-5">
			<ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
			<div className="space-y-2 text-sm text-charcoal">
				<p className="text-base text-black">12-month warranty</p>
				<p>Covers manufacturing faults, material defects and workmanship from the day of delivery or installation.</p>
				<p>Frame &amp; joinery 12 months · Upholstery stitching 6 months</p>
				<Link href="/warranty-policy/" className="inline-block text-black underline underline-offset-4 hover:text-gold">
					Warranty details &amp; claims →
				</Link>
			</div>
		</div>
	);
}

const trust = [
	{ icon: BadgeCheck, label: "100% Satisfaction Guarantee" },
	{ icon: RefreshCcw, label: "30-Day Returns & Exchanges" },
	{ icon: Lock, label: "Secure Checkout" },
	{ icon: Users, label: "Trusted By Thousands" },
];

export function TrustList() {
	return (
		<ul className="space-y-2">
			{trust.map(({ icon: Icon, label }) => (
				<li key={label} className="flex items-center gap-2.5 text-xs text-charcoal">
					<Icon className="size-3.5 text-black" strokeWidth={1.5} aria-hidden />
					{label}
				</li>
			))}
		</ul>
	);
}

/** "Share via:" Facebook, X, LinkedIn, WhatsApp, email */
export function ShareLinks({ name, url }: { name: string; url: string }) {
	const u = encodeURIComponent(url);
	const t = encodeURIComponent(name);
	const links: { label: string; href: string; icon: BrandIconName | "mail" }[] = [
		{ label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: "facebook" },
		{ label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: "x" },
		{ label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: "linkedin" },
		{ label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${name} ${url}`)}`, icon: "whatsapp" },
		{ label: "Email", href: `mailto:?subject=${t}&body=${u}`, icon: "mail" },
	];

	return (
		<div className="flex items-center gap-3 text-xs text-charcoal">
			<span>Share via:</span>
			<ul className="flex items-center gap-1">
				{links.map((l) => (
					<li key={l.label}>
						<a
							href={l.href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`Share on ${l.label}`}
							className="flex size-7 items-center justify-center text-black transition-colors hover:text-gold"
						>
							{l.icon === "mail" ? <Mail className="size-3.5" aria-hidden /> : <BrandIcon name={l.icon} className="size-3.5" />}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}

function Accordion({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
	return (
		<details open={open} className="group border-b border-sand">
			<summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm uppercase text-black [&::-webkit-details-marker]:hidden">
				<h2 className="text-sm">{title}</h2>
				<ChevronDown className="size-4 transition-transform duration-300 group-open:rotate-180" aria-hidden />
			</summary>
			<div className="pb-6">{children}</div>
		</details>
	);
}

const shipping = [
	"Money-Back Guarantee on Defective Items",
	"Worldwide Delivery on All Orders",
	"Safe & Secure Packaging to Prevent Damage",
	"Duties and Taxes Included — No Hidden Fees",
	"Dedicated Support Team",
];

/** Description (open), Specifications and Shipping and Return policy accordions */
export function ProductDetails({ product }: { product: ProductDetail }) {
	return (
		<div className="border-t border-sand">
			{product.description ? (
				<Accordion title="Description" open>
					{/* WP editor content, written by Majeurs staff in wp-admin */}
					<div className="prose-majeurs px-1.5 text-sm text-charcoal [&_h2]:text-base [&_h3]:text-base [&_h3]:text-black" dangerouslySetInnerHTML={{ __html: product.description }} />
				</Accordion>
			) : null}

			{product.specs.length ? (
				<Accordion title="Specifications">
					<table className="w-full text-sm">
						<tbody>
							{product.specs.map((s) => (
								<tr key={s.label} className="border-b border-sand last:border-0">
									<th scope="row" className="w-1/3 py-2.5 pr-4 text-left align-top font-normal text-black">
										{s.label}
									</th>
									<td className="py-2.5 text-charcoal">{s.value}</td>
								</tr>
							))}
						</tbody>
					</table>
				</Accordion>
			) : null}

			<Accordion title="Shipping and Return policy">
				<ul className="space-y-2.5 text-sm text-charcoal">
					{shipping.map((line) => (
						<li key={line} className="flex items-center gap-2.5">
							<Check className="size-4 shrink-0 text-gold" aria-hidden />
							{line}
						</li>
					))}
				</ul>
				<p className="mt-4 text-sm text-charcoal">
					Read our{" "}
					<Link href="/shipping-policy/" className="text-bronze underline underline-offset-4">
						shipping policy
					</Link>{" "}
					and{" "}
					<Link href="/refund_returns/" className="text-bronze underline underline-offset-4">
						return policy
					</Link>
					.
				</p>
			</Accordion>
		</div>
	);
}
