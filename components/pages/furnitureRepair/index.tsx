import { MoveRight } from "lucide-react";
import { buttonStyles } from "@/components/landing/ctaLink";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/common/pageHero";
import { ArrowLink, FaqList, FeatureCards, NumberedSteps, Section, StatList } from "@/components/landing/sections";
import { SplitFeature } from "@/components/landing/splitFeature";
import { FormSection } from "@/components/pages/customRequest/formSection";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { furnitureCare } from "@/lib/content/pages/furnitureCare";
import { RepairForm } from "./repairForm";
import { YoutubeLite } from "./youtubeLite";

/**
 * /furniture-care-service/ (furniture restoration): hero, video split, services, process, facts band,
 * FAQs (with FAQPage JSON-LD), repair request form.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/furnitureCare.ts)
 */
export default async function FurnitureRepairPage() {
	const c = await getPageContent(furnitureCare);
	return (
		<>
			<PageHero
				eyebrow={c.heroEyebrow}
				title={c.heroTitle}
				description={c.heroText}
				image={c.heroImage}
				priCta={c.heroCta.href ? { slug: c.heroCta.href, label: c.heroCta.label } : undefined}
			/>

			<SplitFeature
				image=""
				media={<YoutubeLite id={c.videoId} title={c.videoTitle} />}
				eyebrow={c.introEyebrow}
				title={c.introTitle}
				actions={
					c.introCta.href ? (
						<a href={c.introCta.href} {...(c.introCta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={cn(buttonStyles.primary, "group")}>
							{c.introCta.label}
							<MoveRight className="size-5 transition-[translate] duration-150 ease-out group-hover:translate-x-1" aria-hidden />
						</a>
					) : null
				}
			>
				{paragraphs(c.introText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<Section eyebrow={c.servicesEyebrow} title={c.servicesTitle} intro={c.servicesText} tone="cream">
				<FeatureCards cards={c.services} />
			</Section>

			<Section eyebrow={c.stepsEyebrow} title={c.stepsTitle}>
				<NumberedSteps steps={c.steps} />
			</Section>

			<Section eyebrow={c.factsEyebrow} title={c.factsTitle} tone="sand">
				<StatList stats={c.facts} />
			</Section>

			<Section eyebrow={c.faqEyebrow} title={c.faqTitle} narrow>
				<FaqList items={c.faqs} />
				<ArrowLink cta={c.faqCta} className="mx-auto flex w-fit" />
			</Section>

			<FormSection id="repair" title={c.formTitle} intro={c.formIntro} className="bg-[#f8f6f2]">
				<RepairForm />
			</FormSection>
		</>
	);
}
