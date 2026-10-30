import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { whatsappLink } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { jacquards, weaves, type Swatch } from "./swatches";
import { WP_URL } from "@/lib/api/wp";

const UPLOADS = `${WP_URL}/wp-content/uploads`;
/** warm off-white bands, as on WP */
const warm = "bg-[#f7f4ef]";

// Section ids are linked from the product page ("Material & care guide →") and the hero chips: keep them stable
const chips = [
	{ label: "Leather", href: "#leather" },
	{ label: "Velvet", href: "#velvet" },
	{ label: "Upholstery fabrics", href: "#upholstery-fabrics" },
	{ label: "Everyday care", href: "#everyday-care" },
];

type MaterialProps = {
	id: string;
	number: string;
	name: string;
	image: string;
	imageAlt: string;
	imageSide: "left" | "right";
	intro: string;
	note: string;
	care: string[];
	avoid: string[];
	className?: string;
};

function CheckList({ items, kind }: { items: string[]; kind: "do" | "avoid" }) {
	const Icon = kind === "do" ? Check : X;
	return (
		<ul className="divide-y divide-sand border-t border-sand">
			{items.map((item) => (
				<li key={item} className="flex gap-3 py-3 text-sm text-charcoal">
					<Icon className={cn("mt-0.5 size-4 shrink-0", kind === "do" ? "text-gold" : "text-grey")} aria-hidden />
					{item}
				</li>
			))}
		</ul>
	);
}

function Material({ id, number, name, image, imageAlt, imageSide, intro, note, care, avoid, className }: MaterialProps) {
	return (
		<section id={id} className={cn("scroll-mt-28 px-2.5 py-14 md:px-5 md:py-24", className)}>
			<div className="container-site grid items-start gap-10 md:grid-cols-2 md:gap-16">
				<div className={cn("relative aspect-square overflow-hidden bg-sand-50 md:sticky md:top-28", imageSide === "right" && "md:order-2")}>
					<Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
				</div>
				<div className="space-y-6">
					<div className="space-y-3">
						<p className="eyebrow">Material {number}</p>
						<h2 className="text-h3">{name}</h2>
						<p className="text-sm text-charcoal">{intro}</p>
						<p className="border-l-2 border-gold bg-white/60 px-4 py-3 text-xs text-charcoal">{note}</p>
					</div>
					<div className="space-y-3">
						<h3 className="text-h4">Caring for {name.toLowerCase()}</h3>
						<CheckList items={care} kind="do" />
					</div>
					<div className="space-y-3">
						<h4 className="text-xs uppercase tracking-button text-black">Avoid</h4>
						<CheckList items={avoid} kind="avoid" />
					</div>
				</div>
			</div>
		</section>
	);
}

function SwatchGrid({ swatches, large = false }: { swatches: Swatch[]; large?: boolean }) {
	return (
		<ul className={cn("grid gap-x-3 gap-y-5", large ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-7")}>
			{swatches.map((s) => (
				<li key={s.name} className="space-y-1.5">
					<div className={cn("relative overflow-hidden bg-sand-50", large ? "aspect-[3/2]" : "aspect-square")}>
						<Image src={s.image} alt={`${s.name} fabric swatch`} fill sizes={large ? "(min-width: 768px) 25vw, 50vw" : "(min-width: 768px) 14vw, 33vw"} className="object-cover" />
					</div>
					<p className="text-xs text-black">{s.name}</p>
					<p className="text-[11px] text-grey">{s.detail}</p>
				</li>
			))}
		</ul>
	);
}

const everyday = [
	{ title: "Light and heat", text: "Sunlight and heat fade and dry out every material. Use curtains or blinds during peak sun and keep furniture away from heaters and vents." },
	{ title: "Spills", text: "Act fast and blot, never rub. Most marks lift easily if they are dealt with before they dry." },
	{ title: "Even wear", text: "Rotate and plump cushions every week or two, and move throw pillows around so no single spot takes all the wear." },
];

/** /materials-and-care/: what each upholstery material is and how to look after it */
export default function MaterialsCarePage() {
	return (
		<>
			<section className={cn(warm, "px-2.5 py-16 text-center md:py-24")}>
				<div className="mx-auto max-w-2xl space-y-5">
					<p className="eyebrow">Materials &amp; care</p>
					<h1 className="text-h1">The materials behind every Majeurs piece</h1>
					<p className="text-sm text-charcoal md:text-base">
						Every upholstered piece is handcrafted in leather, velvet or a woven upholstery fabric. Here is what each one is, how it feels and ages,
						and how to keep it looking its best for years.
					</p>
					<nav aria-label="On this page" className="flex flex-wrap justify-center gap-2 pt-2">
						{chips.map((c) => (
							<a key={c.href} href={c.href} className="border border-black px-4 py-2 text-xs text-black transition-colors hover:bg-black hover:text-white">
								{c.label}
							</a>
						))}
					</nav>
				</div>
			</section>

			<Material
				id="leather"
				number="01"
				name="Leather"
				image={`${UPLOADS}/Sarki-The-Layered-Command-Chair_2.webp`}
				imageAlt="Sarki chair in brown leather"
				imageSide="left"
				intro="Our leather is top-quality, genuine animal hide, selected for its strength, suppleness and natural grain, then cut and finished by hand in our workshop. It is the most durable upholstery we offer and it gets better with age, softening and developing a rich patina with use."
				note="Every hide is unique. Small scars, creases, grain changes and slight colour variation are natural marks of real leather, not defects."
				care={[
					"Dust weekly with a soft, dry, lint-free cloth.",
					"Blot spills straight away with a clean, dry cloth. Dab, don’t rub, and let the area dry naturally.",
					"Condition every 6–12 months with a leather conditioner suited to your finish. Test it on a hidden spot first.",
					"Keep it at least 50 cm from radiators, heaters and air-conditioning vents, and out of strong direct sunlight, to stop drying, cracking and fading.",
				]}
				avoid={[
					"Soaking with water or using steam cleaners",
					"Household detergents, alcohol, solvents, ammonia or bleach",
					"Furniture polishes, silicone sprays and baby wipes",
					"Sharp objects, belt buckles and pet claws",
				]}
			/>

			<Material
				id="velvet"
				number="02"
				name="Velvet"
				image={`${UPLOADS}/Sarki-The-Layered-Command-Chair_2-2.webp`}
				imageAlt="Sarki chair in blue velvet"
				imageSide="right"
				className={warm}
				intro="Velvet has a short, dense pile that catches the light and feels soft to the touch. Its colour looks deeper or lighter depending on the direction of the pile, which is part of its character."
				note="Light marks where the pile has been pressed (from sitting or cushions) are normal and can be brushed or steamed back."
				care={[
					"Vacuum weekly on low suction with a soft brush attachment.",
					"Brush gently in the direction of the pile with a soft clothes brush to keep it even.",
					"Blot spills at once with a clean, dry, white cloth. Don’t rub.",
					"Lift crushed pile with a handheld steamer held a few centimetres away, then brush lightly.",
					"Plump and rotate cushions regularly, and keep out of strong direct sunlight to prevent fading.",
				]}
				avoid={["Soaking or scrubbing the pile", "Bleach or harsh household cleaners", "Ironing directly on the fabric"]}
			/>

			<section id="upholstery-fabrics" className="scroll-mt-28 px-2.5 py-14 md:px-5 md:py-24">
				{/* old WP links use #fabrics */}
				<span id="fabrics" className="block scroll-mt-28" aria-hidden />
				<div className="container-site space-y-12">
					<div className="max-w-2xl space-y-3">
						<p className="eyebrow">Material 03</p>
						<h2 className="text-h3">Upholstery fabrics</h2>
						<p className="text-sm text-charcoal">
							Woven upholstery fabrics in soft, natural tones, made from blends of polyester, rayon and natural fibres such as cotton. They are
							designed for soft upholstery and suit living rooms and bedrooms with light to moderate everyday use.
						</p>
					</div>

					<div className="space-y-5">
						<div className="space-y-2">
							<h3 className="text-h4">Jacquards</h3>
							<p className="text-sm text-charcoal">The pattern is woven into the fabric, not printed on, giving each design a gentle texture and depth.</p>
						</div>
						<SwatchGrid swatches={jacquards} />
					</div>

					<div className="space-y-5">
						<div className="space-y-2">
							<h3 className="text-h4">Plain, textured and linen-look weaves</h3>
							<p className="text-sm text-charcoal">Quiet, solid-colour fabrics that let the shape of the piece lead.</p>
						</div>
						<SwatchGrid swatches={weaves} large />
					</div>

					<div className="grid gap-10 md:grid-cols-2 md:gap-16">
						<div className="space-y-3">
							<h3 className="text-h4">Caring for upholstery fabrics</h3>
							<CheckList
								kind="do"
								items={[
									"Vacuum weekly with a soft brush attachment to lift dust and grit from the weave.",
									"Blot spills immediately with a clean, dry, white cloth, working from the outside in.",
									"Plump, turn and rotate loose cushions regularly so they wear evenly.",
									"Keep out of strong direct sunlight to protect the colour.",
								]}
							/>
						</div>
						<div className="space-y-3">
							<h3 className="text-h4">Cleaning</h3>
							<ul className="divide-y divide-sand border-t border-sand">
								<li className="flex gap-3 py-3 text-sm text-charcoal">
									<Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
									<span>
										<strong className="font-normal text-black">Dry clean only.</strong> For stains or a deep clean, use a professional upholstery
										cleaner.
									</span>
								</li>
								{["Don’t machine wash or tumble dry removable covers.", "Don’t use bleach, solvents or household stain removers."].map((item) => (
									<li key={item} className="flex gap-3 py-3 text-sm text-charcoal">
										<X className="mt-0.5 size-4 shrink-0 text-grey" aria-hidden />
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>

					<p className="text-xs text-grey">
						Swatches are shown as accurately as possible, but colours vary between screens. If an exact colour match matters to you, message us
						before you order.
					</p>
				</div>
			</section>

			<section id="everyday-care" className={cn(warm, "scroll-mt-28 px-2.5 py-14 md:px-5 md:py-24")}>
				<div className="container-site space-y-8">
					<div className="space-y-2">
						<p className="eyebrow">For every piece</p>
						<h2 className="text-h3">Everyday care</h2>
					</div>
					<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{everyday.map((c) => (
							<li key={c.title} className="space-y-3 border border-sand bg-white p-6">
								<h3 className="text-lg text-black">{c.title}</h3>
								<p className="text-sm text-charcoal">{c.text}</p>
							</li>
						))}
						<li className="space-y-3 border border-sand bg-white p-6">
							<h3 className="text-lg text-black">Professional care</h3>
							<p className="text-sm text-charcoal">
								For deep cleaning, re-upholstery or repairs, our{" "}
								<Link href="/furniture-care-service/" className="text-bronze underline underline-offset-4 hover:text-gold">
									furniture care team
								</Link>{" "}
								can restore your piece.
							</p>
						</li>
					</ul>
				</div>
			</section>

			<section className="bg-black px-2.5 py-16 text-center md:py-24">
				<div className="mx-auto max-w-2xl space-y-5">
					<h2 className="text-h3 text-white">Have a different colour or material in mind?</h2>
					<p className="text-sm text-sand">
						We make every piece to order. Tell us what you&apos;re looking for and we&apos;ll help you find the right material for your piece.
					</p>
					<div className="flex flex-wrap justify-center gap-3 pt-2">
						<a
							href={whatsappLink("Hello Majeurs, I'd like help choosing a material for my furniture.\n\nhttps://majeurs.com/materials-and-care/")}
							target="_blank"
							rel="noopener noreferrer"
							className="btn border-white bg-white text-black hover:border-gold hover:bg-gold hover:text-white"
						>
							<BrandIcon name="whatsapp" className="size-4" />
							Chat with us on WhatsApp
						</a>
						<Link href="/shop/" className="btn border-white text-white hover:bg-white hover:text-black">
							Browse the shop
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
