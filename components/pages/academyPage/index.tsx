import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { SectionIntro, SplitFeature } from "@/components/landing/splitFeature";
import { YoutubeLite } from "@/components/pages/furnitureRepair/youtubeLite";
import { whatsappLink } from "@/lib/contact";
import { IMAGES, VIDEO, academyWhatsapp, employerCards, forYou, gains, notForYou, socials, sponsorships, tracks } from "./content";

const APPLY = academyWhatsapp("Hello Majeurs Furniture Academy, I'd like to apply for the next cohort.");
const SIGN_UP = academyWhatsapp("Hello Majeurs Furniture Academy, I'd like to sign up for the 6-month diploma program.");

function List({ items, icon: Icon = Check, tone = "text-gold" }: { items: string[]; icon?: typeof Check; tone?: string }) {
	return (
		<ul className="space-y-2 text-sm text-charcoal">
			{items.map((item) => (
				<li key={item} className="flex gap-2.5">
					<Icon className={`mt-1 size-3.5 shrink-0 ${tone}`} aria-hidden />
					{item}
				</li>
			))}
		</ul>
	);
}

function ImageCard({ image, title, subtitle, children }: { image: string; title: string; subtitle?: string; children: React.ReactNode }) {
	return (
		<div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center">
			<div className="relative aspect-[4/3] overflow-hidden bg-sand-50">
				<Image src={image} alt="" fill sizes="(min-width: 1025px) 25vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
			</div>
			<div className="space-y-3">
				<h3 className="text-lg text-black">{title}</h3>
				{subtitle ? <p className="text-xs text-charcoal">{subtitle}</p> : null}
				{children}
			</div>
		</div>
	);
}

/** /majeurs-furniture-academy/: the 6-month diploma program, hiring graduates and sponsorship */
export default function AcademyPage() {
	return (
		<>
			{/* Hero */}
			<section className="px-2.5 py-20 md:px-5 md:py-28">
				<div className="container-site max-w-3xl space-y-5 lg:mx-0 lg:ml-[max(1.25rem,calc((100vw-90rem)/2))]">
					<p className="eyebrow">Majeurs Furniture Academy</p>
					<h1 className="font-display text-h2">Build a Career in Furniture Manufacturing, Not Just a Skill.</h1>
					<div className="space-y-2 text-sm text-charcoal md:text-base">
						<p>Join a selective 6-month training program designed to produce world-class furniture makers and manufacturers.</p>
						<p>We train, test, and place serious individuals into real production environments.</p>
					</div>
					<p className="text-xs text-black">Only 2 cohorts per year. Limited seats per cohort.</p>
					<a href={APPLY} target="_blank" rel="noopener noreferrer" className="btn border-black text-black hover:bg-black hover:text-white">
						Apply for the next cohort
					</a>
					<p className="text-xs text-grey">Applications are reviewed. Only qualified candidates will be selected.</p>
				</div>
			</section>

			{/* What this program is */}
			<SplitFeature image={IMAGES.sketch} media={<YoutubeLite id={VIDEO.id} title={VIDEO.title} />} title="What This Program Is" className="pt-0 md:pt-0">
				<p>At Majeurs Furniture Academy, we don&apos;t train hobbyists. We develop disciplined, production-ready furniture manufacturers.</p>
				<p>This is a hands-on, high-performance program built within a real furniture manufacturing environment.</p>
				<p className="pt-2 text-black">What you gain:</p>
				<List items={gains} />
			</SplitFeature>

			{/* Who this is for */}
			<section className="bg-sand px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro title="Who This Is For">
						<p>Become a furniture maker and manufacturer in 6 months.</p>
						<p className="mt-3 text-xs text-black">
							<span className="text-charcoal">Session:</span> March – August <span className="mx-2 text-grey">•</span>
							<span className="text-charcoal">Price:</span> ₦1.5 million for boarding | ₦650,000 for day
						</p>
					</SectionIntro>
					<div className="grid gap-10 lg:grid-cols-2">
						<ImageCard image={IMAGES.sketch} title="This program is for you if:">
							<List items={forYou} />
						</ImageCard>
						<ImageCard image={IMAGES.team} title="This program is NOT for you if:">
							<List items={notForYou} icon={X} tone="text-charcoal" />
						</ImageCard>
					</div>
				</div>
			</section>

			{/* Funding options */}
			<section className="px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro title="Funding Options">
						<p>We offer two pathways for entry.</p>
					</SectionIntro>
					<div className="grid gap-10 lg:grid-cols-2">
						{tracks.map((t) => (
							<ImageCard key={t.title} image={t.image} title={t.title} subtitle={t.subtitle}>
								<List items={t.points} />
							</ImageCard>
						))}
					</div>
				</div>
			</section>

			{/* Hire a graduate */}
			<section className="px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-8">
					<div className="max-w-3xl space-y-3">
						<p className="eyebrow">For employers</p>
						<h2 className="font-display text-h3">Hire an Academy graduate</h2>
						<p className="text-sm text-charcoal">
							Need skilled furniture makers? Majeurs Furniture Academy graduates complete a selective 6-month, hands-on program inside a working
							furniture manufacturing environment, and are tested before they finish. We connect workshops, factories and interiors businesses with
							graduates and SIWES interns who are ready for real production work.
						</p>
					</div>
					<ul className="grid gap-4 md:grid-cols-3">
						{employerCards.map((c) => (
							<li key={c.title} className="space-y-3 bg-sand p-6">
								<h3 className="text-lg text-black">{c.title}</h3>
								<p className="text-sm text-charcoal">{c.text}</p>
							</li>
						))}
					</ul>
					<div className="flex flex-wrap gap-3">
						<a
							href={whatsappLink("Hello Majeurs, I'd like to hire a Majeurs Furniture Academy graduate.")}
							target="_blank"
							rel="noopener noreferrer"
							className="btn border-black bg-black text-white hover:border-gold hover:bg-gold"
						>
							Hire a graduate
						</a>
						<Link href="/contact-majeurs-holdings/" className="btn border-black text-black hover:bg-black hover:text-white">
							Contact us
						</Link>
					</div>
				</div>
			</section>

			{/* Become a sponsor */}
			<section className="px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro title="Become A Sponsor">
						<p>
							Collaborate with Majeurs Academy to train the next generation of African furniture makers. Support internships (SIWES), scholarships,
							equipment grants and industry mentorship.
						</p>
					</SectionIntro>
					<ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
						{sponsorships.map((s) => (
							<li key={s.title} className="flex flex-col gap-3">
								<div className="relative aspect-[3/2] overflow-hidden bg-sand-50">
									<Image src={s.image} alt="" fill sizes="(min-width: 1025px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
								</div>
								<h3 className="text-lg text-black">{s.title}</h3>
								<p className="text-sm text-charcoal">{s.text}</p>
								<a
									href={academyWhatsapp(`Hello Majeurs Furniture Academy, I'd like to become a partner: ${s.title}.`)}
									target="_blank"
									rel="noopener noreferrer"
									className="btn mt-auto w-fit border-black px-4 py-2 text-xs text-black hover:bg-black hover:text-white"
								>
									Become a partner
								</a>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Get started */}
			<section className="relative isolate overflow-hidden px-2.5 py-20 text-center md:px-5 md:py-32">
				<Image src={IMAGES.team} alt="" fill sizes="100vw" className="-z-20 object-cover" />
				<div className="absolute inset-0 -z-10 bg-black/80" aria-hidden />
				<div className="mx-auto max-w-2xl space-y-5 text-white">
					<p className="text-xs uppercase tracking-eyebrow text-sand">Get started</p>
					<h2 className="font-display text-h3 text-white">Earn a diploma in furniture making in 6 months.</h2>
					<p className="text-sm text-sand">Get a diploma in furniture manufacturing and an Advanced Professional Diploma with our 6-month program.</p>
					<ul className="flex justify-center gap-2">
						{socials.map((s) => (
							<li key={s.label}>
								<a
									href={s.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Majeurs Academy on ${s.label}`}
									className="flex size-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-gold hover:text-white"
								>
									<BrandIcon name={s.icon} className="size-4" />
								</a>
							</li>
						))}
					</ul>
					<a href={SIGN_UP} target="_blank" rel="noopener noreferrer" className="btn border-white bg-white text-black hover:bg-black hover:text-white">
						Sign up now
					</a>
				</div>
			</section>
		</>
	);
}
