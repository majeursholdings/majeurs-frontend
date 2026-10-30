import Image from "next/image";
import { BellRing, Lock, Plus, ShoppingBag, type LucideIcon } from "lucide-react";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { rootAndReverence } from "@/lib/content/pages/rootAndReverence";
import { WaitlistButton, type WaitlistCopy } from "./waitlist";
import { LiteYouTube } from "./liteYouTube";
import { PieceStory } from "./pieceStory";

/** Icons for the collector steps, by position */
const stepIcons: LucideIcon[] = [Plus, Lock, BellRing, ShoppingBag];

function WaitlistLink({ label, copy, className = "text-gold" }: { label: string; copy: WaitlistCopy; className?: string }) {
	return <WaitlistButton variant="link" label={label} copy={copy} className={`hover:text-white ${className}`} />;
}

/**
 * /root-and-reverence-collection/: the debut limited-edition collection by Demi Samande.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/rootAndReverence.ts)
 */
export default async function RootAndReverencePage() {
	const c = await getPageContent(rootAndReverence);
	const waitlist: WaitlistCopy = { eyebrow: c.waitlistEyebrow, title: c.waitlistTitle, paragraphs: paragraphs(c.waitlistText) };
	const storyCopy = { readMore: c.storyButton, waitlistButton: c.storyWaitlistButton, stock: c.storyStock, waitlist };
	return (
		<>
			{/* Hero: Mama Rainbow on the bike, title with a gold rule */}
			<section className="relative isolate flex min-h-112 items-end justify-center overflow-hidden px-2.5 pb-12 text-center md:min-h-152 md:pb-16">
				<Image src={c.heroImage} alt={c.heroImageAlt} fill priority sizes="100vw" className="-z-20 object-cover" />
				<div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0000_30%,#000000c0_100%)]" aria-hidden />
				<div className="max-w-2xl space-y-4 text-white">
					<p className="text-xs text-sand">{c.heroEyebrow}</p>
					<h1 className="font-display text-display text-white">{c.heroTitle}</h1>
					<span className="mx-auto block h-0.5 w-28 bg-gold" aria-hidden />
					{paragraphs(c.heroText).map((p) => (
						<p key={p} className="text-sm text-sand md:text-base">
							{p}
						</p>
					))}
					<WaitlistButton label={c.waitlistButton} copy={waitlist} className="mt-2 border-black/60 bg-black/60 text-white hover:border-gold hover:bg-gold" />
				</div>
			</section>

			{/* From Maker to Designer */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid items-center gap-8 md:grid-cols-2 md:gap-12">
					<div className="relative aspect-video overflow-hidden bg-black">
						<LiteYouTube id={c.makerVideoId} title={c.makerVideoTitle} />
					</div>
					<div className="space-y-4">
						<h2 className="text-h4">{c.makerTitle}</h2>
						<div className="space-y-3 text-sm text-charcoal">
							{paragraphs(c.makerText).map((p) => (
								<p key={p}>{p}</p>
							))}
						</div>
						<figure className="space-y-2">
							<blockquote className="text-sm italic text-black">{`“${c.makerQuote}”`}</blockquote>
							<figcaption className="text-sm text-black">{`— ${c.makerQuoteBy}`}</figcaption>
						</figure>
					</div>
				</div>
			</section>

			{/* The Keeper of the Stories */}
			<section>
				<div className="relative aspect-4/3 md:aspect-2/1">
					<Image src={c.keeperImage} alt={c.keeperImageAlt} fill sizes="100vw" className="object-cover object-[60%_30%]" />
				</div>
				<div className="bg-brown px-2.5 py-14 md:px-5 md:py-20">
					<div className="container-site">
						<div className="max-w-xl space-y-4 text-sand">
							<h2 className="text-h4 text-white">{c.keeperTitle}</h2>
							{paragraphs(c.keeperText).map((p) => (
								<p key={p} className="text-sm">
									{p}
								</p>
							))}
							<WaitlistLink label={c.waitlistButton} copy={waitlist} />
						</div>
					</div>
				</div>
			</section>

			{/* The three pieces */}
			<section className="px-2.5 py-12.5 md:px-5 md:py-24">
				<div className="container-site grid gap-10 lg:grid-cols-[1fr_3fr] lg:gap-8">
					<div className="space-y-4 lg:pt-4">
						<h2 className="text-h4">{c.piecesTitle}</h2>
						{paragraphs(c.piecesText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
						<WaitlistLink label={c.waitlistButton} copy={waitlist} className="text-bronze hover:text-gold!" />
					</div>
					<ul className="grid gap-8 sm:grid-cols-3 sm:gap-5">
						{c.pieces.map((piece) => (
							<li key={piece.name} className="space-y-3">
								<div className="relative aspect-square overflow-hidden bg-sand-50">
									<Image src={piece.image} alt={`${piece.name}, Roots and Reverence`} fill sizes="(min-width: 1025px) 22vw, (min-width: 640px) 33vw, 100vw" className="object-cover" />
								</div>
								<h3 className="text-lg text-black">{piece.name}</h3>
								<p className="text-xs text-charcoal">{piece.meaning}</p>
								<PieceStory
									piece={{
										name: piece.name,
										headline: piece.headline,
										story: paragraphs(piece.story),
										quote: piece.quote,
										gallery: piece.gallery.map((g) => g.image),
										details: piece.details,
									}}
									copy={storyCopy}
								/>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* How To Become A Collector */}
			<section className="px-2.5 pb-16 md:px-5 md:pb-28">
				<div className="container-site space-y-12">
					<div className="space-y-2 text-center">
						<h2 className="text-h4">{c.stepsTitle}</h2>
						{paragraphs(c.stepsText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
					</div>
					<ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
						{c.steps.map(({ title, text }, i) => {
							const Icon = stepIcons[i] ?? Plus;
							return (
								<li key={title} className="space-y-3">
									<span className="flex size-10 items-center justify-center rounded-full border border-gold text-gold">
										<Icon className="size-4.5" strokeWidth={1.5} aria-hidden />
									</span>
									<h3 className="text-lg text-black">{title}</h3>
									<p className="text-sm text-charcoal">{text}</p>
								</li>
							);
						})}
					</ol>
				</div>
			</section>
		</>
	);
}
