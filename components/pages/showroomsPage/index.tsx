import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { DEFAULT_HERO_IMAGE, PageHero } from "@/components/common/pageHero";
import { SectionIntro } from "@/components/landing/splitFeature";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { SITE_URL, whatsappLink } from "@/lib/contact";
import { WP_URL } from "@/lib/api/wp";

const UPLOADS = `${WP_URL}/wp-content/uploads`;

/** Addresses from the contact page and the Rank Math local KML (app/(seo)/locations.kml) */
const showroom = {
	name: "Lagos showroom and workshop",
	street: "32, QMB Builders Mart Road, Opposite Elf Bus Stop",
	area: "Lekki Phase 1, Lagos State, Nigeria",
	postcode: "105102",
	phone: { label: "+234 201 330 6192", href: "tel:+2342013306192" },
};

const ukOffice = {
	name: "United Kingdom office",
	address: "71–75 Shelton Street, Covent Garden, London, WC2H 9JQ",
	phone: { label: "+44 7936 520391", href: "tel:+447936520391" },
};

const mapsUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const visitReasons = [
	{ title: "Styling consultations", text: "Bring your floor plan or a few photos and our brand specialists will help you choose pieces, sizes and finishes." },
	{ title: "Shopping advice", text: "Sit on the sofas, feel the leathers, velvets and woven fabrics, and compare finishes side by side." },
	{ title: "A tour of the workshop", text: "See how every piece is made to order in Lagos, from frame and joinery to upholstery." },
];

const fullAddress = `${showroom.street}, ${showroom.area} ${showroom.postcode}`;

export default function ShowroomsPage() {
	const schema = {
		"@context": "https://schema.org",
		"@type": "FurnitureStore",
		name: "Majeurs Holdings",
		url: `${SITE_URL}/showrooms/`,
		telephone: "+2342013306192",
		address: {
			"@type": "PostalAddress",
			streetAddress: showroom.street,
			addressLocality: "Lekki Phase 1",
			addressRegion: "Lagos",
			postalCode: showroom.postcode,
			addressCountry: "NG",
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />

			<PageHero className="min-h-80 md:min-h-[420px]" title="Showrooms">
				<p className="text-sm text-sand">Visit our Lagos showroom and workshop. We welcome visitors by appointment.</p>
			</PageHero>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid items-center gap-8 md:grid-cols-2 md:gap-12">
					<div className="relative aspect-[4/3] overflow-hidden bg-sand-50">
						<Image src={DEFAULT_HERO_IMAGE} alt="Majeurs showroom in Lagos" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
					</div>
					<div className="space-y-5">
						<p className="eyebrow">Lagos, Nigeria</p>
						<h2 className="text-h3 font-display">{showroom.name}</h2>
						<ul className="space-y-3 text-sm text-charcoal">
							<li className="flex gap-3">
								<MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<address className="not-italic">
									{showroom.street}
									<br />
									{showroom.area} {showroom.postcode}
								</address>
							</li>
							<li className="flex gap-3">
								<Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<a href={showroom.phone.href} className="hover:text-gold">
									{showroom.phone.label}
								</a>
							</li>
							<li className="flex gap-3">
								<CalendarCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<span>Open by appointment only. Book a time and we&apos;ll have a specialist ready for you.</span>
							</li>
						</ul>
						<div className="flex flex-wrap gap-3 pt-2">
							<Link href="/plan-a-visitation/" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
								Plan a visit
							</Link>
							<a href={mapsUrl(fullAddress)} target="_blank" rel="noopener noreferrer" className="btn border-black text-black hover:bg-black hover:text-white">
								Get directions
							</a>
							<a
								href={whatsappLink("Hello Majeurs, I'd like to visit your Lagos showroom.")}
								target="_blank"
								rel="noopener noreferrer"
								className="btn border-whatsapp bg-whatsapp text-white hover:border-[#1ebe5a] hover:bg-[#1ebe5a]"
							>
								<BrandIcon name="whatsapp" className="size-4" />
								WhatsApp us
							</a>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-sand px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro eyebrow="Why visit" title="See it, sit on it, make it yours">
						Book a time with our in-store brand specialists, in person or digitally, for styling consultations, shopping advice or a walk-through of our
						latest collections.
					</SectionIntro>
					<ul className="grid gap-5 md:grid-cols-3">
						{visitReasons.map((r) => (
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
						<Image src={`${UPLOADS}/Demi-Samande-Majeurs-Holdings.webp`} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
					</div>
					<div className="space-y-4">
						<p className="eyebrow">London, United Kingdom</p>
						<h2 className="text-h3 font-display">{ukOffice.name}</h2>
						<p className="text-sm text-charcoal">
							For enquiries from the UK and Europe. Our furniture is made in Lagos and delivered worldwide; get in touch to arrange a consultation.
						</p>
						<ul className="space-y-3 text-sm text-charcoal">
							<li className="flex gap-3">
								<MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<address className="not-italic">{ukOffice.address}</address>
							</li>
							<li className="flex gap-3">
								<Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
								<a href={ukOffice.phone.href} className="hover:text-gold">
									{ukOffice.phone.label}
								</a>
							</li>
						</ul>
						<Link href="/contact-majeurs-holdings/" className="btn border-black text-black hover:bg-black hover:text-white">
							Contact us
						</Link>
					</div>
				</div>
			</section>

			<CustomizeCta fullBleed image={DEFAULT_HERO_IMAGE} />
		</>
	);
}
