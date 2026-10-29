import type { Metadata } from "next";
import { Logo } from "@/components/common/logo";
import { FormAndTableDemo } from "./formAndTableDemo";

export const metadata: Metadata = {
	title: "Design system",
	robots: { index: false, follow: false },
};

const swatches = [
	{ name: "black", hex: "#000000", className: "bg-black" },
	{ name: "ink", hex: "#1F252C", className: "bg-ink" },
	{ name: "charcoal", hex: "#4D4D4D", className: "bg-charcoal" },
	{ name: "grey", hex: "#AAAAAA", className: "bg-grey" },
	{ name: "sand", hex: "#E2DDDB", className: "bg-sand" },
	{ name: "cream", hex: "#F7E9C5", className: "bg-cream" },
	{ name: "gold", hex: "#B2902F", className: "bg-gold" },
	{ name: "gold-muted", hex: "#9B8854", className: "bg-gold-muted" },
	{ name: "bronze", hex: "#695006", className: "bg-bronze" },
	{ name: "brown", hex: "#53390B", className: "bg-brown" },
];

/** Internal reference page: /design-system (not indexed). Delete before launch if you don't want it public. */
export default function DesignSystemPage() {
	return (
		<div className="container-site space-y-16 py-16">
			<section className="flex flex-wrap items-center gap-10">
				<Logo priority />
				<div className="bg-black p-6">
					<Logo variant="light" href={null} />
				</div>
			</section>

			<section className="space-y-4">
				<p className="eyebrow">Colours</p>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
					{swatches.map((s) => (
						<div key={s.name} className="border border-border">
							<div className={`h-20 ${s.className}`} />
							<div className="p-3 text-sm">
								<div className="font-normal">{s.name}</div>
								<div className="text-muted-foreground">{s.hex}</div>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="space-y-6">
				<p className="eyebrow">Typography</p>
				<p className="text-display">Handcrafted African Furniture</p>
				<h1 className="font-display">For Professionals Who Specify</h1>
				<h2 className="font-display">Built for the people who specify</h2>
				<h2>All New From Our Furniture Showroom</h2>
				<h3>Complete the Room</h3>
				<h4>Made to commission</h4>
				<p className="text-lg">Uzoe – 3 Seaters Leather Sofa · ₦1,250,000</p>
				<p className="max-w-2xl">
					Every furniture piece moves through the same artisan hands from raw material to final finish. No outsourced
					production. No shortcuts in the joinery.
				</p>
				<p className="text-sm text-muted-foreground">Small text · 14px</p>
				<a href="#" className="text-bronze uppercase tracking-button">
					Read blog →
				</a>
			</section>

			<section className="flex flex-wrap gap-4">
				<button className="btn bg-black text-white hover:bg-ink">Add to cart</button>
				<button className="btn border-black text-black hover:bg-black hover:text-white">Shop all →</button>
				<button className="btn bg-brown text-white hover:bg-bronze">Apply for trade access</button>
				<button className="btn bg-whatsapp text-white normal-case tracking-normal">Buy on WhatsApp</button>
			</section>

			<FormAndTableDemo />
		</div>
	);
}
