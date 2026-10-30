import { Suspense } from "react";
import Link from "next/link";
import { PageHero } from "@/components/common/pageHero";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { SplitFeature } from "@/components/landing/splitFeature";
import { FormSection } from "@/components/pages/customRequest/formSection";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { planAVisitation } from "@/lib/content/pages/planAVisitation";
import { VisitationForm } from "./visitationForm";

/**
 * /plan-a-visitation/: hero, "Schedule a Date" split, booking form, customise band.
 * WP shows the Schedule block twice and a broken image; built once here, with a showroom photo.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/planAVisitation.ts)
 */
export default async function PlanAVisitationPage() {
	const c = await getPageContent(planAVisitation);
	return (
		<>
			<PageHero title={c.heroTitle} description={c.heroText} image={c.heroImage} />

			<SplitFeature
				image={c.scheduleImage}
				imageAlt={c.scheduleImageAlt}
				title={c.scheduleTitle}
				actions={
					<>
						{c.locationsCta.href ? (
							<Link
								href={c.locationsCta.href}
								{...(c.locationsCta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
								className="btn border-black text-black hover:bg-black hover:text-white"
							>
								{c.locationsCta.label}
							</Link>
						) : null}
						{c.bookCta.href ? (
							<a
								href={c.bookCta.href}
								{...(c.bookCta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
								className="btn border-black bg-black text-white hover:border-gold hover:bg-gold"
							>
								{c.bookCta.label}
							</a>
						) : null}
					</>
				}
			>
				{paragraphs(c.scheduleText).map((p) => (
					<p key={p}>{p}</p>
				))}
			</SplitFeature>

			<FormSection id="book" title={c.formTitle} className="pt-0 md:pt-0">
				{/* MainForm's date field reads the current date while rendering, so it renders per visit */}
				<Suspense fallback={<div className="h-[640px] animate-pulse bg-sand-50" aria-label="Loading the booking form" />}>
					<VisitationForm />
				</Suspense>
			</FormSection>

			<CustomizeCta image={c.ctaImage} fullBleed />
		</>
	);
}
