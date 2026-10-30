import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/common/pageHero";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { getPageContent } from "@/lib/content/get";
import { paragraphs, type Cta } from "@/lib/content/model";
import { leadership } from "@/lib/content/pages/leadership";
import { cn } from "@/lib/utils";

type Member = { name: string; focus: string; image: string };

/** Board grid with the WP header row: title on the left, "Our team" / "Join us" on the right */
function Board({ title, members, links }: { title: string; members: Member[]; links: [Cta, Cta] }) {
	return (
		<section className="px-2.5 pb-12.5 md:px-5 md:pb-20">
			<div className="container-site">
				<div className="mb-8 flex items-center justify-between gap-4 border-y border-sand py-5">
					<h2 className="text-sm uppercase tracking-button text-black">{title}</h2>
					<div className="flex items-center divide-x divide-sand text-xs uppercase tracking-button">
						{links.map((l, i) =>
							l.href ? (
								<Link key={i} href={l.href} className={cn(i === 0 ? "pr-4" : "pl-4", "text-bronze underline underline-offset-4 hover:text-gold")}>
									{l.label}
								</Link>
							) : null,
						)}
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

/** Copy and photos from the page's fields in wp-admin (lib/content/pages/leadership.ts) */
export default async function LeadershipPage() {
	const c = await getPageContent(leadership);
	const links: [Cta, Cta] = [c.boardTeamCta, c.boardJoinCta];
	return (
		<>
			<PageHero className="min-h-80 md:min-h-[420px]" title={c.heroTitle} image={c.heroImage} overlayClassName="bg-black/70">
				{paragraphs(c.heroText).map((p) => (
					<p key={p} className="mx-auto max-w-2xl text-sm text-sand">
						{p}
					</p>
				))}
			</PageHero>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid items-center gap-8 md:grid-cols-2 md:gap-12">
					<div className="relative aspect-[3/2] overflow-hidden bg-sand-50">
						<Image src={c.founderImage} alt={c.founderImageAlt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
					</div>
					<div className="space-y-4">
						<h2 className="font-display text-h2">{c.founderName}</h2>
						<p className="text-xs uppercase tracking-button text-black">{c.founderRole}</p>
						{paragraphs(c.founderBio).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
					</div>
				</div>
			</section>

			<Board title={c.academyTitle} members={c.academyBoard} links={links} />
			<Board title={c.furnitureTitle} members={c.furnitureBoard} links={links} />

			<ShopNowBand />
		</>
	);
}
