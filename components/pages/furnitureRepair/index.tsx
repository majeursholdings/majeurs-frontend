import { PageHero } from "@/components/common/pageHero";
import { SplitFeature } from "@/components/landing/splitFeature";
import { FormSection } from "@/components/pages/customRequest/formSection";
import { RepairForm } from "./repairForm";
import { YoutubeLite } from "./youtubeLite";

const facts = [
	{ value: "170+", label: "Satisfied customers" },
	{ value: "13", label: "Fixers" },
	{ value: "73", label: "Business customers" },
	{ value: "4300+", label: "Furniture like new" },
];

/** /furniture-care-service/: hero, video split, facts band, repair request form */
export default function FurnitureRepairPage() {
	return (
		<>
			<PageHero title="Furniture Repair Services" description="Looking to have your old sofa or furniture fixed or professionally reshaped?" />

			<SplitFeature
				image=""
				media={<YoutubeLite id="gweTL08_VEU" title="Majeurs furniture repair" />}
				title="Your Furniture, As New Again"
				actions={
					<a href="#repair" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
						Request a quote now
					</a>
				}
			>
				<p>
					At Majeurs, you&apos;ve come to the right place for your furniture reshape, fix-up, and complete furniture remake. Our specialists
					maintain the wood quality, material density, and thorough process planning, giving your furniture a new look, energy, and aesthetics to
					match your space, home, and office again.
				</p>
			</SplitFeature>

			<section className="bg-sand px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-10 text-center">
					<div className="space-y-3">
						<p className="text-xs uppercase tracking-eyebrow text-black">Don&apos;t believe us, believe the facts!</p>
						<h2 className="text-h3 font-display">The facts say a lot about our services</h2>
					</div>
					<dl className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
						{facts.map((fact) => (
							<div key={fact.label} className="flex flex-col-reverse gap-2">
								<dt className="text-xs uppercase tracking-button text-charcoal">{fact.label}</dt>
								<dd className="text-h2 text-black">{fact.value}</dd>
							</div>
						))}
					</dl>
				</div>
			</section>

			<FormSection id="repair" title="Our sofa fixers are ready to help you" intro="Book an appointment now or contact us for the furniture remake.">
				<RepairForm />
			</FormSection>
		</>
	);
}
