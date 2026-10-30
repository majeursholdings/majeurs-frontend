import { CircleArrowRight, Minus, Plus } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { decodeEntities } from "@/lib/api/wp";
import { getPageContent } from "@/lib/content/get";
import { faqs } from "@/lib/content/pages/faqs";
import { HelpBar } from "./helpBar";
import { SocialLinks } from "./socialLinks";

/** Answer HTML -> plain text for the FAQPage JSON-LD, one line per paragraph */
const answerText = (html: string) =>
	decodeEntities(
		html
			.replace(/<\/p>\s*<p[^>]*>|<br\s*\/?>/g, "\n")
			.replace(/<[^>]+>/g, "")
			.replace(/&nbsp;/g, " "),
	).trim();

/** /faqs/: hero, "Need help?" bar, sticky section nav + social icons, accordions per section. Copy from the page's fields in wp-admin (lib/content/pages/faqs.ts) */
export default async function FaqsPage() {
	const c = await getPageContent(faqs);
	const schema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: c.sections.flatMap((s) =>
			s.items.map((item) => ({
				"@type": "Question",
				name: item.q,
				acceptedAnswer: { "@type": "Answer", text: answerText(item.a) },
			})),
		),
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
			<PageHero title={c.heroTitle} />
			<HelpBar />

			<div className="px-2.5 py-12.5 md:px-5 md:py-16">
				<div className="container-site grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-0">
					<aside className="lg:border-r lg:border-sand lg:pr-8">
						<div className="space-y-8 lg:sticky lg:top-28">
							<nav aria-label="FAQ sections">
								<h2 className="mb-4 text-xs uppercase tracking-button text-black">{c.navTitle}</h2>
								<ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
									{c.sections.map((s) => (
										<li key={s.anchor}>
											<a href={`#${s.anchor}`} className="inline-flex items-center gap-2 text-xs text-ink underline underline-offset-4 hover:text-gold">
												<CircleArrowRight className="size-3.5 shrink-0" aria-hidden />
												{s.title}
											</a>
										</li>
									))}
								</ul>
							</nav>
							<div>
								<h2 className="mb-4 text-xs uppercase tracking-button text-black">{c.socialTitle}</h2>
								<SocialLinks />
							</div>
						</div>
					</aside>

					<div className="space-y-12 lg:pl-8">
						{c.sections.map((section) => (
							<section key={section.anchor} id={section.anchor} aria-labelledby={`${section.anchor}-title`} className="scroll-mt-28 space-y-4">
								<h2 id={`${section.anchor}-title`} className="text-xs uppercase tracking-button text-black">
									{section.title}
								</h2>
								<div className="space-y-2">
									{section.items.map((item, i) => (
										<details key={item.q} open={i === 0} className="group border border-sand">
											<summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm text-black [&::-webkit-details-marker]:hidden">
												<Plus className="size-4 shrink-0 group-open:hidden" aria-hidden />
												<Minus className="hidden size-4 shrink-0 group-open:block" aria-hidden />
												<h3 className="text-sm">{item.q}</h3>
											</summary>
											<div
												className="space-y-2 border-t border-sand px-4 py-3 text-sm text-charcoal [&_a]:text-bronze [&_a]:underline [&_a]:underline-offset-2"
												dangerouslySetInnerHTML={{ __html: item.a }}
											/>
										</details>
									))}
								</div>
							</section>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
