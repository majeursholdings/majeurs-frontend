import { Suspense } from "react";
import Link from "next/link";
import { DEFAULT_HERO_IMAGE, PageHero } from "@/components/common/pageHero";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { SplitFeature } from "@/components/landing/splitFeature";
import { FormSection } from "@/components/pages/customRequest/formSection";
import { VisitationForm } from "./visitationForm";

/**
 * /plan-a-visitation/: hero, "Schedule a Date" split, booking form, customise band.
 * WP shows the Schedule block twice and a broken image; built once here, with a showroom photo.
 */
export default function PlanAVisitationPage() {
	return (
		<>
			<PageHero title="Plan A Visitation" description="We accept walk-in customers in our factory and showrooms only by appointment." />

			<SplitFeature
				image="https://majeurs.com/wp-content/uploads/Placing_chair_and_table_2K_202609042308-scaled.webp"
				imageAlt="A Majeurs armchair and side table being placed in a showroom"
				title="Schedule a Date"
				actions={
					<>
						<Link href="/showrooms/" className="btn border-black text-black hover:bg-black hover:text-white">
							Store locations
						</Link>
						<a href="#book" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
							Book consultation
						</a>
					</>
				}
			>
				<p>
					Book a time with our in-store brand specialists, either digitally or in person, for your furniture styling consultations, shopping
					advice, or a personal walk-through of our latest collections from the World of Majeurs Holdings.
				</p>
			</SplitFeature>

			<FormSection id="book" title="Book your visit" className="pt-0 md:pt-0">
				{/* MainForm's date field reads the current date while rendering, so it renders per visit */}
				<Suspense fallback={<div className="h-[640px] animate-pulse bg-sand-50" aria-label="Loading the booking form" />}>
					<VisitationForm />
				</Suspense>
			</FormSection>

			<CustomizeCta image={DEFAULT_HERO_IMAGE} fullBleed />
		</>
	);
}
