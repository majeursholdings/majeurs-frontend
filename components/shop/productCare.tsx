import Link from "next/link";
import { ChevronDown, MoveRight } from "lucide-react";

/** Short versions of the tips on /materials-and-care/ (copied from the live page, 29 Oct 2026) */
const materials = [
	{
		name: "Leather",
		tips: [
			"Dust weekly with a soft, dry, lint-free cloth.",
			"Blot spills straight away with a clean, dry cloth. Dab, don’t rub.",
			"Condition every 6–12 months with a leather conditioner, tested on a hidden spot first.",
			"Keep at least 50 cm from heaters and air-conditioning vents, and out of strong sunlight.",
		],
	},
	{
		name: "Velvet",
		tips: [
			"Vacuum weekly on low suction with a soft brush attachment.",
			"Brush gently in the direction of the pile to keep it even.",
			"Lift crushed pile with a handheld steamer held a few centimetres away.",
			"Plump and rotate cushions regularly, and keep out of strong sunlight.",
		],
	},
	{
		name: "Upholstery fabrics",
		tips: [
			"Vacuum weekly with a soft brush attachment to lift dust from the weave.",
			"Blot spills with a clean, dry, white cloth, working from the outside in.",
			"Dry clean only. Don’t machine wash or tumble dry removable covers.",
			"Avoid bleach, solvents and household stain removers.",
		],
	},
];

/** "Caring for your pieces" on the cart page: per-material tips, and where to go for more */
export function ProductCare() {
	return (
		<section aria-labelledby="product-care-title" className="space-y-6 bg-sand-50 p-6 md:p-8">
			<div className="space-y-2">
				<p className="eyebrow">Product care</p>
				<h2 id="product-care-title" className="text-h4">
					Caring for your pieces
				</h2>
				<p className="text-sm text-charcoal">Every piece is handcrafted to last. A few simple habits keep it looking its best for years.</p>
			</div>

			<div className="divide-y divide-sand border-y border-sand">
				{materials.map((material) => (
					<details key={material.name} className="group">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm text-black [&::-webkit-details-marker]:hidden">
							{material.name}
							<ChevronDown className="size-4 shrink-0 transition-[rotate] duration-150 ease-out group-open:rotate-180" strokeWidth={1.5} aria-hidden />
						</summary>
						<ul className="list-disc space-y-1.5 pb-5 pl-5 text-sm text-charcoal marker:text-gold">
							{material.tips.map((tip) => (
								<li key={tip}>{tip}</li>
							))}
						</ul>
					</details>
				))}
			</div>

			<div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8">
				<Link href="/materials-and-care/" className="group inline-flex items-center gap-2 text-bronze underline-offset-4 hover:underline">
					Full materials &amp; care guide
					<MoveRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
				</Link>
				<Link href="/furniture-care-service/" className="group inline-flex items-center gap-2 text-bronze underline-offset-4 hover:underline">
					Repairs, restoration and deep cleaning
					<MoveRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
				</Link>
			</div>
		</section>
	);
}
