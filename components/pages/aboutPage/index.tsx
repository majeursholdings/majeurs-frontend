import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/common/pageHero";
import { SectionIntro, SplitFeature } from "@/components/landing/splitFeature";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { cn } from "@/lib/utils";

const UPLOADS = "https://majeurs.com/wp-content/uploads";

/** Small outlined button used under cards on the About page */
export const smallButton = "btn px-4 py-2 text-xs border-black text-black hover:bg-black hover:text-white";

const values = [
	{
		eyebrow: "Mission",
		title: "Revolutionise Furniture Manufacturing",
		text: "Bring craftsmanship, technology and sustainability together so African makers can produce at global standards, with traceability, efficiency and pride in every piece.",
		image: `${UPLOADS}/The-Atunlo-collection-sketch-work-done-by-Demi-Samande.webp`,
	},
	{
		eyebrow: "Vision",
		title: "Africa Competing on the World Stage",
		text: "A new era of African manufacturing, where local talent and businesses scale globally without compromising on quality or the planet.",
		image: `${UPLOADS}/Soft-touch-of-Majeurs-Umoya-ArmChair.webp`,
	},
];

const pillars = [
	{
		eyebrow: "Craft",
		title: "Majeurs Furniture",
		text: "Handcrafted furniture designed and made in our Lagos workshop, with solid materials, honest joinery and finishes built to age beautifully. Every piece is made to order, with custom sizes and fabrics available, and our six-month Majeurs Academy trains the artisans behind it.",
		image: `${UPLOADS}/close-up-shoot-showing-Majeurs-workman-working-on-a-wood-piece.webp`,
		cta: { label: "Shop the collection", href: "/shop/" },
	},
	{
		eyebrow: "Technology",
		title: "MANDE",
		text: "A community of furniture makers with shared access to industrial machinery, a CAD and tech suite, a material library, mentorship and business coaching, backed by a staged, photo-documented payment system that builds trust between makers and their clients.",
		image: `${UPLOADS}/Majeurs-Academy-students-learningf-from-their-instructor.webp`,
		cta: { label: "Explore MANDE", href: "/mande/" },
	},
	{
		eyebrow: "Sustainability",
		title: "Àtúnlo",
		text: "Nothing of value is wasted. Àtúnlo turns reclaimed timber off-cuts from our workshop into handcrafted bowls, trays, stools and serveware, keeping material at its highest value. The collection supports UN Sustainable Development Goal 12, Responsible Consumption and Production, and creates skilled local jobs along the way.",
		image: `${UPLOADS}/Atunlo-Collection-SetUp-1024x683.webp`,
		cta: { label: "Discover Àtúnlo", href: "https://atunlo.majeurs.com/?referral=majeurs-about", external: true },
	},
];

const tiers = [
	{ name: "Silver", discount: "5% off", spend: "From ₦10M annual spend" },
	{ name: "Gold", discount: "12–15% off", spend: "From ₦25M annual spend" },
	{ name: "Platinum", discount: "15–20% off", spend: "From ₦50M annual spend" },
];

const people = [
	{ title: "Our Leadership", image: `${UPLOADS}/Demi-Samande-Majeurs-Holdings.webp`, cta: { label: "View Leadership", href: "/majeurs-leadership/" } },
	{ title: "Career", image: `${UPLOADS}/The-Majeurs-Academy-Program-Guarantee-1024x683.webp`, cta: { label: "Join Us", href: "/career/" } },
];

const projects = [
	{
		eyebrow: "Hospitality · Lagos · 2022",
		title: "GAIA Africa Lounge",
		text: "The lounge for GAIA Africa, a private members’ business club for women in Lagos. We designed and furnished its seating zones, bar and drinks station.",
		image: `${UPLOADS}/Gaia-Africa-Lounge-Area-1024x1024.webp`,
		cta: { label: "View project", href: "/project/gaia-africa-lounge-area/" },
	},
	{
		eyebrow: "Commercial · Lagos",
		title: "Gerrard Holdings",
		text: "A complete turnkey commercial interior, designed, manufactured and installed by Majeurs from start to finish.",
		image: `${UPLOADS}/A-complete-turnkey-commercial-interior-1024x765.webp`,
		cta: { label: "Discuss a similar project", href: "/get-a-quote-for-custom-made-furniture-in-lagos/" },
	},
];

function CardLink({ cta }: { cta: { label: string; href: string; external?: boolean } }) {
	return cta.external ? (
		<a href={cta.href} target="_blank" rel="noopener noreferrer" className={smallButton}>
			{cta.label}
		</a>
	) : (
		<Link href={cta.href} className={smallButton}>
			{cta.label}
		</Link>
	);
}

function CardImage({ src, aspect = "aspect-[4/3]", sizes }: { src: string; aspect?: string; sizes: string }) {
	return (
		<div className={cn("relative overflow-hidden bg-sand-50", aspect)}>
			<Image src={src} alt="" fill sizes={sizes} className="object-cover" />
		</div>
	);
}

export default function AboutPage() {
	return (
		<>
			<PageHero
				className="min-h-80 md:min-h-[420px]"
				title="About Majeurs Holdings"
				image={`${UPLOADS}/Close-up-picture-of-Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp`}
				overlayClassName="bg-black/65"
			>
				<p className="mx-auto max-w-xl text-base text-sand md:text-lg">
					Founded in London in 2010 and rooted in Lagos since 2016, Majeurs makes furniture that improves with use.
				</p>
			</PageHero>

			<SplitFeature image={`${UPLOADS}/Majeurs-furniture-workman-working-on-a-wood-piece.webp`} title="About Majeurs">
				<p>
					Majeurs Holdings is a Lagos-based furniture house built on three pillars: Craft, Technology and Sustainability. We design and make
					handcrafted furniture under the Majeurs brand, power a growing community of independent furniture makers through MANDE, and turn our own
					workshop off-cuts into homeware with Àtúnlo. Everything we do works toward one goal: proving that furniture made in Africa can meet, and
					set, global standards.
				</p>
			</SplitFeature>

			<SplitFeature image={`${UPLOADS}/Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp`} imageSide="right" title="Our Story" className="pt-0 md:pt-0">
				<p>
					We started as furniture restorers, and the pieces we repaired taught us how good materials and honest joinery age. That respect still
					shapes everything we make. Today we pair artisan skill with modern production systems and circular thinking, so every piece is built well,
					delivered on time and made responsibly, while creating skilled jobs in Lagos.
				</p>
			</SplitFeature>

			<section className="bg-cream px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid gap-10 md:grid-cols-2 md:gap-12">
					{values.map((v) => (
						<div key={v.eyebrow} className="grid grid-cols-[2fr_3fr] items-center gap-5">
							<CardImage src={v.image} sizes="(min-width: 768px) 20vw, 40vw" />
							<div className="space-y-2">
								<p className="text-xs uppercase tracking-button text-black">{v.eyebrow}</p>
								<h3 className="font-display text-xl text-black">{v.title}</h3>
								<p className="text-sm text-charcoal">{v.text}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="bg-sand px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro eyebrow="Our Pillars" title="Craft. Technology. Sustainability.">
						Three parts of one business, each built to raise the standard of furniture made in Africa.
					</SectionIntro>
					<div className="grid gap-10 md:grid-cols-3 md:gap-5">
						{pillars.map((p) => (
							<article key={p.title} className="flex flex-col gap-3">
								<CardImage src={p.image} sizes="(min-width: 768px) 33vw, 100vw" />
								<p className="mt-2 text-xs uppercase tracking-button text-black">{p.eyebrow}</p>
								<h3 className="font-display text-xl text-black">{p.title}</h3>
								<p className="flex-1 text-sm text-charcoal">{p.text}</p>
								<div>
									<CardLink cta={p.cta} />
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<SplitFeature
				image={`${UPLOADS}/For-interior-designers-designers-architects-and-FFE-specifiers-1024x765.webp`}
				eyebrow="The Majeurs Trade Program"
				title="Up to 20% trade discount for industry professionals"
				actions={
					<>
						<Link href="/majeurs-trade-program/#tradeProgramForm" className={smallButton}>
							Join the Trade Program
						</Link>
						<Link href="/majeurs-trade-program/" className={smallButton}>
							See full trade benefits
						</Link>
					</>
				}
			>
				<p>
					Open to architects, interior designers, property developers, hoteliers, procurement teams and project managers. Trade members work
					directly with our Lagos workshop and get custom dimensions, material and finish flexibility, coordinated production timelines and a
					dedicated project contact, with discounts that grow with your annual spend.
				</p>
				<ul className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
					{tiers.map((t) => (
						<li key={t.name} className="border border-sand p-4">
							<p className="text-xs uppercase tracking-button text-gold-muted">{t.name}</p>
							<p className="mt-1 text-lg text-black">{t.discount}</p>
							<p className="mt-1 text-xs text-grey">{t.spend}</p>
						</li>
					))}
				</ul>
			</SplitFeature>

			<section className="px-2.5 pb-12.5 md:px-5 md:pb-20">
				<div className="container-site grid gap-10 md:grid-cols-2 md:gap-12">
					{people.map((p) => (
						<article key={p.title} className="space-y-3">
							<CardImage src={p.image} sizes="(min-width: 768px) 50vw, 100vw" />
							<h2 className="pt-1 font-display text-xl text-black">{p.title}</h2>
							<CardLink cta={p.cta} />
						</article>
					))}
				</div>
			</section>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro eyebrow="Our Projects" title="Spaces we have designed, made and installed">
						From members’ clubs to full commercial fit-outs, we take projects from first drawing to final installation, with every piece made in our
						Lagos workshop.
					</SectionIntro>
					<div className="grid gap-10 md:grid-cols-2 md:gap-12">
						{projects.map((p) => (
							<article key={p.title} className="space-y-3">
								<CardImage src={p.image} sizes="(min-width: 768px) 50vw, 100vw" />
								<p className="pt-1 text-xs uppercase tracking-button text-black">{p.eyebrow}</p>
								<h3 className="font-display text-xl text-black">{p.title}</h3>
								<p className="text-sm text-charcoal">{p.text}</p>
								<CardLink cta={p.cta} />
							</article>
						))}
					</div>
				</div>
			</section>

			<CustomizeCta fullBleed image={`${UPLOADS}/Close-up-picture-of-Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp`} />
		</>
	);
}
