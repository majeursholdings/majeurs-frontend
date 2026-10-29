import Link from "next/link";
import { PageHero } from "@/components/common/pageHero";
import { ShopNowBand } from "@/components/landing/shopNowBand";
import { SplitFeature } from "@/components/landing/splitFeature";

const UPLOADS = "https://majeurs.com/wp-content/uploads";

const steps = [
	{ title: "Share your idea", text: "A sketch, a photo or a rough idea: tell us the piece, the space and how it will be used." },
	{ title: "Design and quote", text: "We propose dimensions, materials and finishes, with a quote and a delivery window, usually within 24 hours." },
	{ title: "Made in Lagos", text: "Your piece is handcrafted in our Lagos workshop, then delivered and installed by our team." },
];

/** /bespoke-product/: empty on WP; a short page that explains commissions and routes to the request and quote forms */
export default function BespokeProductPage() {
	return (
		<>
			<PageHero
				title="Bespoke Product"
				description="Furniture made to your size, finish and style, from first sketch to final detail."
				image={`${UPLOADS}/Demi-Samande-of-Majeurs-working-on-a-furniture-product-sketch.webp`}
			/>

			<SplitFeature
				image={`${UPLOADS}/Majeurs-workman-actively-working-on-a-Atunlo-collection-design.webp`}
				imageAlt="A Majeurs craftsman working on a bespoke piece"
				eyebrow="Made to commission"
				title="Your piece, built from scratch"
				actions={
					<>
						<Link href="/custom-made-furniture-in-lagos/" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
							Start a custom request
						</Link>
						<Link href="/get-a-quote-for-custom-made-furniture-in-lagos/" className="btn border-black text-black hover:bg-black hover:text-white">
							Get a quote
						</Link>
					</>
				}
			>
				<p>
					Have an idea for your space? Let’s build it, from first sketch to final detail. From long sofas to full office furniture sets, home
					offices, bedroom sets, kitchens and built-ins, everything is tailored to fit your space and your style.
				</p>
				<p>Whether you already have a plan or just a rough idea, our designers and craftsmen will help you bring it to life.</p>
			</SplitFeature>

			<section className="bg-sand-50 px-2.5 py-12.5 md:px-5 md:py-20">
				<ol className="container-site grid gap-8 md:grid-cols-3">
					{steps.map((step, i) => (
						<li key={step.title} className="space-y-2 border-t border-black pt-5">
							<p className="text-h4 text-gold-muted">{String(i + 1).padStart(2, "0")}</p>
							<h2 className="text-lg text-black">{step.title}</h2>
							<p className="text-sm text-charcoal">{step.text}</p>
						</li>
					))}
				</ol>
			</section>

			<div className="pt-16 md:pt-24">
				<ShopNowBand />
			</div>
		</>
	);
}
