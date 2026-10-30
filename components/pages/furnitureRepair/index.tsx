import { PageHero } from "@/components/common/pageHero";
import { SplitFeature } from "@/components/landing/splitFeature";
import { FormSection } from "@/components/pages/customRequest/formSection";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { furnitureCare } from "@/lib/content/pages/furnitureCare";
import { RepairForm } from "./repairForm";
import { YoutubeLite } from "./youtubeLite";

/**
 * /furniture-care-service/: hero, video split, facts band, repair request form.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/furnitureCare.ts)
 */
export default async function FurnitureRepairPage() {
	const c = await getPageContent(furnitureCare);
	return (
		<>
			<PageHero title={c.heroTitle} description={c.heroText} image={c.heroImage} />

			<SplitFeature
				image=""
				media={<YoutubeLite id={c.videoId} title={c.videoTitle} />}
				title={c.introTitle}
				actions={
					c.introCta.href ? (
						<a
							href={c.introCta.href}
							{...(c.introCta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
							className="btn border-black bg-black text-white hover:border-gold hover:bg-gold"
						>
							{c.introCta.label}
						</a>
					) : null
				}
			>
				{paragraphs(c.introText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<section className="bg-sand px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-10 text-center">
					<div className="space-y-3">
						<p className="text-xs uppercase tracking-eyebrow text-black">{c.factsEyebrow}</p>
						<h2 className="text-h3 font-display">{c.factsTitle}</h2>
					</div>
					<dl className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
						{c.facts.map((fact) => (
							<div key={fact.label} className="flex flex-col-reverse gap-2">
								<dt className="text-xs uppercase tracking-button text-charcoal">{fact.label}</dt>
								<dd className="text-h2 text-black">{fact.value}</dd>
							</div>
						))}
					</dl>
				</div>
			</section>

			<FormSection id="repair" title={c.formTitle} intro={c.formIntro}>
				<RepairForm />
			</FormSection>
		</>
	);
}
