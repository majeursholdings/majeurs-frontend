import Image from "next/image";
import { PageHero } from "@/components/common/pageHero";
import { buttonStyles, CtaLink } from "@/components/landing/ctaLink";
import { SectionIntro, SplitFeature } from "@/components/landing/splitFeature";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { events } from "@/lib/content/pages/events";

/**
 * /events/: empty on WP. Upcoming events editors add in wp-admin, or a "nothing on" message, then a showroom visit CTA.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/events.ts)
 */
export default async function EventsPage() {
	const c = await getPageContent(events);
	return (
		<>
			<PageHero title={c.heroTitle} description={c.heroText} image={c.heroImage} />

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site space-y-10">
					<SectionIntro eyebrow={c.introEyebrow} title={c.introTitle}>
						{paragraphs(c.introText).map((p) => (
							<p key={p}>{p}</p>
						))}
					</SectionIntro>

					{c.items.length ? (
						<ul className="grid gap-10 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
							{c.items.map((e) => (
								<li key={`${e.title}-${e.date}`} className="flex flex-col gap-3">
									<div className="relative aspect-[4/3] overflow-hidden bg-sand-50">
										{e.image ? <Image src={e.image} alt="" fill sizes="(min-width: 1025px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" /> : null}
									</div>
									<p className="mt-2 text-xs uppercase tracking-button text-gold-muted">{[e.date, e.location].filter(Boolean).join(" · ")}</p>
									<h3 className="font-display text-xl text-black">{e.title}</h3>
									<div className="flex-1 space-y-2 text-sm text-charcoal">
										{paragraphs(e.description).map((p) => (
											<p key={p}>{p}</p>
										))}
									</div>
									<div>
										<CtaLink cta={e.cta} className={buttonStyles.small} />
									</div>
								</li>
							))}
						</ul>
					) : (
						<div className="mx-auto max-w-2xl border border-sand px-6 py-10 text-center text-sm text-charcoal">
							{paragraphs(c.emptyText).map((p) => (
								<p key={p}>{p}</p>
							))}
						</div>
					)}
				</div>
			</section>

			<SplitFeature
				className="bg-sand"
				image={c.visitImage}
				imageAlt=""
				eyebrow={c.visitEyebrow}
				title={c.visitTitle}
				actions={<CtaLink cta={c.visitCta} className={buttonStyles.primary} />}
			>
				{paragraphs(c.visitText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>
		</>
	);
}
