import Image from "next/image";
import { BellRing, Lock, Plus, ShoppingBag, type LucideIcon } from "lucide-react";
import { EXPLAINER_VIDEO, HERO_IMAGE, KEEPER_IMAGE, pieces } from "./data";
import { WaitlistButton } from "./waitlist";
import { LiteYouTube } from "./liteYouTube";
import { PieceStory } from "./pieceStory";

const steps: { icon: LucideIcon; title: string; text: string }[] = [
	{ icon: Plus, title: "Join Waitlist", text: "Fill out the waitlist form to reserve your place." },
	{ icon: Lock, title: "Hold Your Place", text: "Your position is locked the moment you join; first come, first served." },
	{ icon: BellRing, title: "Get Notified", text: "An email and a purchase invite will be sent when it's your turn." },
	{ icon: ShoppingBag, title: "Make The Purchase.", text: "Make a payment and get the product delivered to your location." },
];

function WaitlistLink({ className = "text-gold" }: { className?: string }) {
	return <WaitlistButton variant="link" className={`hover:text-white ${className}`} />;
}

/** /root-and-reverence-collection/: the debut limited-edition collection by Demi Samande */
export default function RootAndReverencePage() {
	return (
		<>
			{/* Hero: Mama Rainbow on the bike, title with a gold rule */}
			<section className="relative isolate flex min-h-[28rem] items-end justify-center overflow-hidden px-2.5 pb-12 text-center md:min-h-[38rem] md:pb-16">
				<Image src={HERO_IMAGE} alt="Mama Rainbow riding a bike, holding the Dandan chair" fill priority sizes="100vw" className="-z-20 object-cover" />
				<div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0000_30%,#000000c0_100%)]" aria-hidden />
				<div className="max-w-2xl space-y-4 text-white">
					<p className="text-xs text-sand">A debut collection by Majeurs Holdings</p>
					<h1 className="font-display text-display text-white">Roots and Reverence</h1>
					<span className="mx-auto block h-0.5 w-28 bg-gold" aria-hidden />
					<p className="text-sm text-sand md:text-base">
						A three-piece limited-edition furniture collection. Each collection tells a unique story deeply rooted in African heritage.
					</p>
					<WaitlistButton className="mt-2 border-black/60 bg-black/60 text-white hover:border-gold hover:bg-gold" />
				</div>
			</section>

			{/* From Maker to Designer */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid items-center gap-8 md:grid-cols-2 md:gap-12">
					<div className="relative aspect-video overflow-hidden bg-black">
						<LiteYouTube id={EXPLAINER_VIDEO.id} title={EXPLAINER_VIDEO.title} />
					</div>
					<div className="space-y-4">
						<h2 className="text-h4">From Maker to Designer</h2>
						<div className="space-y-3 text-sm text-charcoal">
							<p>
								For over a decade, Majeurs Holdings has been the maker behind other people&apos;s visions. Furniture built with precision. Designs
								executed with integrity. Craft that never asked for credit.
							</p>
							<p>Roots &amp; Reverence is the first time we have asked a different question.</p>
							<p>
								This debut collection, three pieces, each rooted in the depth of African heritage, marks the moment that manufacturing and design
								fully merge. It is not a departure from what Majeurs does. It is the fullest expression of it.
							</p>
							<p>Designed by Demi Samande. Made in Nigeria. Limited to 50 units per piece.</p>
						</div>
						<figure className="space-y-2">
							<blockquote className="text-sm italic text-black">
								&ldquo;Design is not only about shaping materials. It is about shaping new possibilities.&rdquo;
							</blockquote>
							<figcaption className="text-sm text-black">— Demi Samande, Founder, Majeurs Holdings</figcaption>
						</figure>
					</div>
				</div>
			</section>

			{/* The Keeper of the Stories */}
			<section>
				<div className="relative aspect-[4/3] md:aspect-[2/1]">
					<Image src={KEEPER_IMAGE} alt="Mama Rainbow seated in the Abobaku chair" fill sizes="100vw" className="object-cover object-[60%_30%]" />
				</div>
				<div className="bg-brown px-2.5 py-14 md:px-5 md:py-20">
					<div className="container-site">
						<div className="max-w-xl space-y-4 text-sand">
							<h2 className="text-h4 text-white">The Keeper of the Stories</h2>
							<p className="text-sm">Mama Rainbow is not an endorser. She is the soul of this collection.</p>
							<p className="text-sm">
								As a cultural anchor, beloved by generations, rooted in the living traditions of African storytelling, her presence in Roots &amp;
								Reverence transforms these furniture pieces from objects into inheritance.
							</p>
							<p className="text-sm">She carries what the furniture is trying to say. When a story is told by its keeper, it becomes sacred.</p>
							<WaitlistLink />
						</div>
					</div>
				</div>
			</section>

			{/* The three pieces */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site grid gap-10 lg:grid-cols-[1fr_3fr] lg:gap-8">
					<div className="space-y-4 lg:pt-4">
						<h2 className="text-h4">Created for Heritage Collectors, Not just Buyers</h2>
						<p className="text-sm text-charcoal">Explore the thoughtful inspiration behind our collections.</p>
						<WaitlistLink className="text-bronze hover:!text-gold" />
					</div>
					<ul className="grid gap-8 sm:grid-cols-3 sm:gap-5">
						{pieces.map((piece) => (
							<li key={piece.name} className="space-y-3">
								<div className="relative aspect-square overflow-hidden bg-sand-50">
									<Image src={piece.image} alt={`${piece.name}, Roots and Reverence`} fill sizes="(min-width: 1025px) 22vw, (min-width: 640px) 33vw, 100vw" className="object-cover" />
								</div>
								<h3 className="text-lg text-black">{piece.name}</h3>
								<p className="text-xs text-charcoal">{piece.meaning}</p>
								<PieceStory piece={piece} />
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* How To Become A Collector */}
			<section className="px-2.5 pb-16 md:px-5 md:pb-28">
				<div className="container-site space-y-12">
					<div className="space-y-2 text-center">
						<h2 className="text-h4">How To Become A Collector</h2>
						<p className="text-sm text-charcoal">Remember, it is three pieces. 50 units each.</p>
					</div>
					<ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
						{steps.map(({ icon: Icon, title, text }) => (
							<li key={title} className="space-y-3">
								<span className="flex size-10 items-center justify-center rounded-full border border-gold text-gold">
									<Icon className="size-4.5" strokeWidth={1.5} aria-hidden />
								</span>
								<h3 className="text-lg text-black">{title}</h3>
								<p className="text-sm text-charcoal">{text}</p>
							</li>
						))}
					</ol>
				</div>
			</section>
		</>
	);
}
