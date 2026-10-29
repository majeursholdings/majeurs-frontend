import Link from "next/link";
import { CircleArrowRight, Minus, Plus } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { faqSections, runText, type Run } from "./faqs";
import { HelpBar } from "./helpBar";
import { SocialLinks } from "./socialLinks";

function Answer({ paragraphs }: { paragraphs: Run[][] }) {
	return (
		<div className="space-y-2 border-t border-sand px-4 py-3 text-sm text-charcoal">
			{paragraphs.map((runs, i) => (
				<p key={i}>
					{runs.map((run, j) =>
						typeof run === "string" ? (
							run
						) : run.href.startsWith("/") ? (
							<Link key={j} href={run.href} className="text-bronze underline underline-offset-2">
								{run.text}
							</Link>
						) : (
							<a key={j} href={run.href} className="text-bronze underline underline-offset-2">
								{run.text}
							</a>
						),
					)}
				</p>
			))}
		</div>
	);
}

/** /faqs/: hero, "Need help?" bar, sticky section nav + social icons, accordions per section */
export default function FaqsPage() {
	const schema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqSections.flatMap((s) =>
			s.items.map((item) => ({
				"@type": "Question",
				name: item.q,
				acceptedAnswer: { "@type": "Answer", text: item.a.map((p) => p.map(runText).join("")).join("\n") },
			})),
		),
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
			<PageHero title="Frequently Asked Questions" />
			<HelpBar />

			<div className="px-2.5 py-12.5 md:px-5 md:py-16">
				<div className="container-site grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-0">
					<aside className="lg:border-r lg:border-sand lg:pr-8">
						<div className="space-y-8 lg:sticky lg:top-28">
							<nav aria-label="FAQ sections">
								<h2 className="mb-4 text-xs uppercase tracking-button text-black">Sections</h2>
								<ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
									{faqSections.map((s) => (
										<li key={s.id}>
											<a href={`#${s.id}`} className="inline-flex items-center gap-2 text-xs text-ink underline underline-offset-4 hover:text-gold">
												<CircleArrowRight className="size-3.5 shrink-0" aria-hidden />
												{s.title}
											</a>
										</li>
									))}
								</ul>
							</nav>
							<div>
								<h2 className="mb-4 text-xs uppercase tracking-button text-black">Social media</h2>
								<SocialLinks />
							</div>
						</div>
					</aside>

					<div className="space-y-12 lg:pl-8">
						{faqSections.map((section) => (
							<section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28 space-y-4">
								<h2 id={`${section.id}-title`} className="text-xs uppercase tracking-button text-black">
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
											<Answer paragraphs={item.a} />
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
