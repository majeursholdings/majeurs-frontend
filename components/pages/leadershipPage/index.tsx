import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/common/pageHero";
import { ShopNowBand } from "@/components/landing/shopNowBand";

const UPLOADS = "https://majeurs.com/wp-content/uploads";

type Member = { name: string; focus: string; image: string };

const academyBoard: Member[] = [
	{ name: "Vivienne Ochee-Bamgboye", focus: "Transformation, capacity-building, multi-sectoral expertise.", image: `${UPLOADS}/Vivienne-Ochee-Bamgboye.webp` },
	{ name: "Andrea Geday", focus: "Visionary construction leader, quality-first approach.", image: `${UPLOADS}/Andrea-Geday.webp` },
	{ name: "Yemi Charles Candide-Johnson", focus: "Legal authority, arbitration, infrastructure advisor.", image: `${UPLOADS}/Yemi-Charles-Candide-Johnson.webp` },
	{ name: "Tejumola Abisoye", focus: "Development strategist, youth empowerment, national skill-building.", image: `${UPLOADS}/tejumola-abisoye.webp` },
];

const furnitureBoard: Member[] = [
	{ name: "Toyosi Olatunji", focus: "Growth strategy, operational clarity, adaptive business models.", image: `${UPLOADS}/Toyosi-Olatunji.webp` },
	{ name: "Steve Babaeko", focus: "Brand storytelling, African consumer culture, creative engagement.", image: `${UPLOADS}/Steve-Babaeko.webp` },
	{ name: "Tiwalola (Abbo D’Léon)", focus: "Data-driven marketing, digital growth, strategic branding.", image: `${UPLOADS}/Tiwalola-Abbo-DLeon.webp` },
	{ name: "Eric Idiahi", focus: "Venture scaling, portfolio strategy, sustainable governance.", image: `${UPLOADS}/Eric-Idiahi.webp` },
	{ name: "Olumide Adeleye", focus: "Industrial scale, lean systems, manufacturing operations.", image: `${UPLOADS}/Olumide-Adeleye.webp` },
	{ name: "Akanimo Ekong PCC", focus: "Talent strategy, team culture, organisational wellbeing.", image: `${UPLOADS}/Akanimo-Ekong-PCC.webp` },
	{ name: "Adenike Ogunlesi", focus: "Inclusive manufacturing, entrepreneurship, and apparel innovation.", image: `${UPLOADS}/Adenike-Ogunlesi.webp` },
	{ name: "Tosin Oshunkoya", focus: "Private equity, global expansion, investment risk insight.", image: `${UPLOADS}/Tosin-Oshunkoya.webp` },
];

/** Board grid with the WP header row: title on the left, "Our team" / "Join us" on the right */
function Board({ title, members }: { title: string; members: Member[] }) {
	return (
		<section className="px-2.5 pb-12.5 md:px-5 md:pb-20">
			<div className="container-site">
				<div className="mb-8 flex items-center justify-between gap-4 border-y border-sand py-5">
					<h2 className="text-sm uppercase tracking-button text-black">{title}</h2>
					<div className="flex items-center divide-x divide-sand text-xs uppercase tracking-button">
						<Link href="/our-team/" className="pr-4 text-bronze underline underline-offset-4 hover:text-gold">
							Our team
						</Link>
						<Link href="/career/" className="pl-4 text-bronze underline underline-offset-4 hover:text-gold">
							Join us
						</Link>
					</div>
				</div>
				<ul className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
					{members.map((m) => (
						<li key={m.name} className="space-y-2">
							<div className="relative aspect-[3/2] overflow-hidden bg-sand-50">
								<Image src={m.image} alt={m.name} fill sizes="(min-width: 1025px) 25vw, 50vw" className="object-cover object-top" />
							</div>
							<h3 className="pt-1 text-xs uppercase tracking-button text-black">{m.name}</h3>
							<p className="text-xs text-charcoal">{m.focus}</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

export default function LeadershipPage() {
	return (
		<>
			<PageHero
				className="min-h-80 md:min-h-[420px]"
				title="Majeurs Leadership"
				image={`${UPLOADS}/majeurs-leadership.webp`}
				overlayClassName="bg-black/70"
			>
				<p className="mx-auto max-w-2xl text-sm text-sand">
					CEO and Founder Demi Samande leads Majeurs Leadership, supported by a board with strong experience in brand, venture growth, operations, and
					talent. Majeurs pairs craftsmanship with technology to build resilient, sustainable manufacturing.
				</p>
			</PageHero>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid items-center gap-8 md:grid-cols-2 md:gap-12">
					<div className="relative aspect-[3/2] overflow-hidden bg-sand-50">
						<Image src={`${UPLOADS}/Demi-Samande-Majeurs-Holdings.webp`} alt="Demi Samande, CEO & Founder of Majeurs" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
					</div>
					<div className="space-y-4">
						<h2 className="font-display text-h2">Demi Samande</h2>
						<p className="text-xs uppercase tracking-button text-black">CEO &amp; Founder</p>
						<p className="text-sm text-charcoal">
							Manufacturing innovation, artisan empowerment and sustainable enterprise. Demi founded Majeurs in London (2010) and expanded operations
							to Lagos (2016), shaping a model where local craftsmanship meets modern systems. With Mande — our vertical-integration platform — and the
							Majeurs Academy, she champions quality, jobs and resilient supply chains.
						</p>
					</div>
				</div>
			</section>

			<Board title="Academy board members" members={academyBoard} />
			<Board title="Furniture board members" members={furnitureBoard} />

			<ShopNowBand />
		</>
	);
}
