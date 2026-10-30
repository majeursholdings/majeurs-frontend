import Image from "next/image";
import { PageHero } from "@/components/common/pageHero";
import { CtaLink } from "@/components/landing/ctaLink";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { ourTeam } from "@/lib/content/pages/ourTeam";

/**
 * /our-team/: hero, the team grid with links to Leadership and Careers, then the Shop Now closer.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/ourTeam.ts)
 */
export default async function OurTeamPage() {
	const c = await getPageContent(ourTeam);
	return (
		<>
			<PageHero className="min-h-80 md:min-h-[420px]" title={c.heroTitle} image={c.heroImage}>
				{paragraphs(c.heroText).map((p) => (
					<p key={p} className="mx-auto max-w-2xl text-sm text-sand">
						{p}
					</p>
				))}
			</PageHero>

			<section className="px-2.5 pb-12.5 pt-8 md:px-5 md:pb-20 md:pt-12">
				<div className="container-site space-y-8">
					<div className="flex flex-wrap items-center justify-between gap-4 border-y border-sand py-4">
						<h2 className="text-xs uppercase tracking-button text-black">{c.teamTitle}</h2>
						<nav aria-label={c.teamTitle} className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-button">
							{c.teamLinks.map(({ cta }) => (
								<CtaLink key={cta.href} cta={cta} className="text-charcoal transition-colors hover:text-gold" />
							))}
						</nav>
					</div>
					<ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
						{c.members.map((m) => (
							<li key={m.name} className="space-y-1">
								<div className="relative mb-3 aspect-[3/2] overflow-hidden bg-sand-50">
									{m.image ? <Image src={m.image} alt={m.name} fill sizes="(min-width: 1025px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" /> : null}
								</div>
								<h3 className="text-sm uppercase tracking-button text-black">{m.name}</h3>
								<p className="text-xs text-charcoal">{m.role}</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			<ShopNowBand />
		</>
	);
}
