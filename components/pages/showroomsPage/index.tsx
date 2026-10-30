import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { PageHero } from "@/components/common/pageHero";
import { SectionIntro } from "@/components/landing/splitFeature";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { SITE_URL, whatsappLink } from "@/lib/contact";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { showrooms } from "@/lib/content/pages/showrooms";

const lagosPhone = { label: "+234 201 330 6192", href: "tel:+2342013306192" };
const ukPhone = { label: "+44 7936 520391", href: "tel:+447936520391" };

const mapsUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/** Copy, addresses and images from the page's fields in wp-admin (lib/content/pages/showrooms.ts) */
export default async function ShowroomsPage() {
	const c = await getPageContent(showrooms);
	const fullAddress = `${c.lagosStreet}, ${c.lagosArea} ${c.lagosPostcode}`;
	const schema = {
		"@context": "https://schema.org",
		"@type": "FurnitureStore",
		name: "Majeurs Holdings",
		url: `${SITE_URL}/showrooms/`,
		telephone: "+2342013306192",
		address: {
			"@type": "PostalAddress",
			streetAddress: c.lagosStreet,
			addressLocality: "Lekki Phase 1",
			addressRegion: "Lagos",
			postalCode: c.lagosPostcode,
			addressCountry: "NG",
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />

			<PageHero className="min-h-80 md:min-h-[420px]" title={c.heroTitle}>
				{paragraphs(c.heroText).map((p) => (
					<p key={p} className="text-sm text-sand">
						{p}
					</p>
				))}
			</PageHero>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid items-center gap-8 md:grid-cols-2 md:gap-12">
					<div className="relative aspect-[4/3] overflow-hidden bg-sand-50">
						<Image src={c.lagosImage} alt={c.lagosImageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
					</div>
					<div className="space-y-5">
						<p className="eyebrow">{c.lagosEyebrow}</p>
						<h2 className="text-h3 font-display">{c.lagosName}</h2>
						<ul className="space-y-3 text-sm text-charcoal">
							<li className="flex gap-3">
								<MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<address className="not-italic">
									{c.lagosStreet}
									<br />
									{c.lagosArea} {c.lagosPostcode}
								</address>
							</li>
							<li className="flex gap-3">
								<Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<a href={lagosPhone.href} className="hover:text-gold">
									{lagosPhone.label}
								</a>
							</li>
							<li className="flex gap-3">
								<CalendarCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<span>{c.lagosHours}</span>
							</li>
						</ul>
						<div className="flex flex-wrap gap-3 pt-2">
							{c.lagosVisit.href ? (
								<Link href={c.lagosVisit.href} className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
									{c.lagosVisit.label}
								</Link>
							) : null}
							<a href={mapsUrl(fullAddress)} target="_blank" rel="noopener noreferrer" className="btn border-black text-black hover:bg-black hover:text-white">
								{c.lagosDirections}
							</a>
							<a
								href={whatsappLink(c.lagosWhatsappMessage)}
								target="_blank"
								rel="noopener noreferrer"
								className="btn border-whatsapp bg-whatsapp text-white hover:border-[#1ebe5a] hover:bg-[#1ebe5a]"
							>
								<BrandIcon name="whatsapp" className="size-4" />
								{c.lagosWhatsapp}
							</a>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-sand px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro eyebrow={c.visitEyebrow} title={c.visitTitle}>
						{c.visitText}
					</SectionIntro>
					<ul className="grid gap-5 md:grid-cols-3">
						{c.visitReasons.map((r) => (
							<li key={r.title} className="space-y-2 bg-white p-6">
								<h3 className="font-display text-lg text-black">{r.title}</h3>
								<p className="text-sm text-charcoal">{r.text}</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid items-center gap-8 md:grid-cols-[1fr_2fr] md:gap-12">
					<div className="relative aspect-square overflow-hidden bg-sand-50">
						<Image src={c.ukImage} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
					</div>
					<div className="space-y-4">
						<p className="eyebrow">{c.ukEyebrow}</p>
						<h2 className="text-h3 font-display">{c.ukName}</h2>
						{paragraphs(c.ukText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
						<ul className="space-y-3 text-sm text-charcoal">
							<li className="flex gap-3">
								<MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<address className="not-italic">{c.ukAddress}</address>
							</li>
							<li className="flex gap-3">
								<Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<a href={ukPhone.href} className="hover:text-gold">
									{ukPhone.label}
								</a>
							</li>
						</ul>
						{c.ukCta.href ? (
							<Link href={c.ukCta.href} className="btn border-black text-black hover:bg-black hover:text-white">
								{c.ukCta.label}
							</Link>
						) : null}
					</div>
				</div>
			</section>

			<CustomizeCta fullBleed image={c.lagosImage} />
		</>
	);
}
