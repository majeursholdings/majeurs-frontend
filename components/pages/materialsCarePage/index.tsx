import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { BrandIcon } from "@/components/common/brandIcons";
import { whatsappLink } from "@/lib/contact";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { materialsCare } from "@/lib/content/pages/materialsCare";
import { cn } from "@/lib/utils";

/** warm off-white bands, as on WP */
const warm = "bg-[#f7f4ef]";

type Swatch = { name: string; image: string; detail: string };

// Section ids (#leather, #velvet, #upholstery-fabrics, #everyday-care) are linked from the product page ("Material & care guide →")
// and the hero links: keep them stable
type MaterialProps = {
	id: string;
	eyebrow: string;
	name: string;
	image: string;
	imageAlt: string;
	imageSide: "left" | "right";
	intro: string;
	note: string;
	careTitle: string;
	care: string[];
	avoidTitle: string;
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

function Material({ id, eyebrow, name, image, imageAlt, imageSide, intro, note, careTitle, care, avoidTitle, avoid, className }: MaterialProps) {
	return (
		<section id={id} className={cn("scroll-mt-28 px-2.5 py-14 md:px-5 md:py-24", className)}>
			<div className="container-site grid items-start gap-10 md:grid-cols-2 md:gap-16">
				<div className={cn("relative aspect-square overflow-hidden bg-sand-50 md:sticky md:top-28", imageSide === "right" && "md:order-2")}>
					<Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
				</div>
				<div className="space-y-6">
					<div className="space-y-3">
						<p className="eyebrow">{eyebrow}</p>
						<h2 className="text-h3">{name}</h2>
						{paragraphs(intro).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
						{paragraphs(note).map((p) => (
							<p key={p} className="border-l-2 border-gold bg-white/60 px-4 py-3 text-xs text-charcoal">
								{p}
							</p>
						))}
					</div>
					<div className="space-y-3">
						<h3 className="text-h4">{careTitle}</h3>
						<CheckList items={care} kind="do" />
					</div>
					<div className="space-y-3">
						<h4 className="text-xs uppercase tracking-button text-black">{avoidTitle}</h4>
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

const texts = (items: { text: string }[]) => items.map((i) => i.text);

/**
 * /materials-and-care/: what each upholstery material is and how to look after it.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/materialsCare.ts)
 */
export default async function MaterialsCarePage() {
	const c = await getPageContent(materialsCare);
	return (
		<>
			<section className={cn(warm, "px-2.5 py-16 text-center md:py-24")}>
				<div className="mx-auto max-w-2xl space-y-5">
					<p className="eyebrow">{c.heroEyebrow}</p>
					<h1 className="text-h1">{c.heroTitle}</h1>
					{paragraphs(c.heroText).map((p) => (
						<p key={p} className="text-sm text-charcoal md:text-base">
							{p}
						</p>
					))}
					<nav aria-label="On this page" className="flex flex-wrap justify-center gap-2 pt-2">
						{c.heroLinks.map(({ cta }) => (
							<a key={cta.href} href={cta.href} className="border border-black px-4 py-2 text-xs text-black transition-colors hover:bg-black hover:text-white">
								{cta.label}
							</a>
						))}
					</nav>
				</div>
			</section>

			<Material
				id="leather"
				eyebrow={c.leatherEyebrow}
				name={c.leatherTitle}
				image={c.leatherImage}
				imageAlt={c.leatherImageAlt}
				imageSide="left"
				intro={c.leatherText}
				note={c.leatherNote}
				careTitle={c.leatherCareTitle}
				care={texts(c.leatherCare)}
				avoidTitle={c.avoidTitle}
				avoid={texts(c.leatherAvoid)}
			/>

			<Material
				id="velvet"
				eyebrow={c.velvetEyebrow}
				name={c.velvetTitle}
				image={c.velvetImage}
				imageAlt={c.velvetImageAlt}
				imageSide="right"
				className={warm}
				intro={c.velvetText}
				note={c.velvetNote}
				careTitle={c.velvetCareTitle}
				care={texts(c.velvetCare)}
				avoidTitle={c.avoidTitle}
				avoid={texts(c.velvetAvoid)}
			/>

			<section id="upholstery-fabrics" className="scroll-mt-28 px-2.5 py-14 md:px-5 md:py-24">
				{/* old WP links use #fabrics */}
				<span id="fabrics" className="block scroll-mt-28" aria-hidden />
				<div className="container-site space-y-12">
					<div className="max-w-2xl space-y-3">
						<p className="eyebrow">{c.fabricsEyebrow}</p>
						<h2 className="text-h3">{c.fabricsTitle}</h2>
						{paragraphs(c.fabricsText).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
					</div>

					<div className="space-y-5">
						<div className="space-y-2">
							<h3 className="text-h4">{c.jacquardsTitle}</h3>
							{paragraphs(c.jacquardsText).map((p) => (
								<p key={p} className="text-sm text-charcoal">
									{p}
								</p>
							))}
						</div>
						<SwatchGrid swatches={c.jacquards} />
					</div>

					<div className="space-y-5">
						<div className="space-y-2">
							<h3 className="text-h4">{c.weavesTitle}</h3>
							{paragraphs(c.weavesText).map((p) => (
								<p key={p} className="text-sm text-charcoal">
									{p}
								</p>
							))}
						</div>
						<SwatchGrid swatches={c.weaves} large />
					</div>

					<div className="grid gap-10 md:grid-cols-2 md:gap-16">
						<div className="space-y-3">
							<h3 className="text-h4">{c.fabricsCareTitle}</h3>
							<CheckList kind="do" items={texts(c.fabricsCare)} />
						</div>
						<div className="space-y-3">
							<h3 className="text-h4">{c.cleaningTitle}</h3>
							<ul className="divide-y divide-sand border-t border-sand">
								<li className="flex gap-3 py-3 text-sm text-charcoal">
									<Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
									<span>
										<strong className="font-normal text-black">{c.cleaningLead}</strong>
										{` ${c.cleaningText}`}
									</span>
								</li>
								{texts(c.cleaningAvoid).map((item) => (
									<li key={item} className="flex gap-3 py-3 text-sm text-charcoal">
										<X className="mt-0.5 size-4 shrink-0 text-grey" aria-hidden />
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>

					{paragraphs(c.swatchNote).map((p) => (
						<p key={p} className="text-xs text-grey">
							{p}
						</p>
					))}
				</div>
			</section>

			<section id="everyday-care" className={cn(warm, "scroll-mt-28 px-2.5 py-14 md:px-5 md:py-24")}>
				<div className="container-site space-y-8">
					<div className="space-y-2">
						<p className="eyebrow">{c.everydayEyebrow}</p>
						<h2 className="text-h3">{c.everydayTitle}</h2>
					</div>
					<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{c.everyday.map((card) => (
							<li key={card.title} className="space-y-3 border border-sand bg-white p-6">
								<h3 className="text-lg text-black">{card.title}</h3>
								<p className="text-sm text-charcoal">{card.text}</p>
							</li>
						))}
						<li className="space-y-3 border border-sand bg-white p-6">
							<h3 className="text-lg text-black">{c.professionalTitle}</h3>
							{/* rich text: links an editor adds get the same style as the default's */}
							<div
								className="space-y-3 text-sm text-charcoal [&_a]:text-bronze [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-gold"
								dangerouslySetInnerHTML={{ __html: c.professionalText }}
							/>
						</li>
					</ul>
				</div>
			</section>

			<section className="bg-black px-2.5 py-16 text-center md:py-24">
				<div className="mx-auto max-w-2xl space-y-5">
					<h2 className="text-h3 text-white">{c.ctaTitle}</h2>
					{paragraphs(c.ctaText).map((p) => (
						<p key={p} className="text-sm text-sand">
							{p}
						</p>
					))}
					<div className="flex flex-wrap justify-center gap-3 pt-2">
						<a
							href={whatsappLink(`${c.ctaWhatsappMessage}\n\nhttps://majeurs.com/materials-and-care/`)}
							target="_blank"
							rel="noopener noreferrer"
							className="btn border-white bg-white text-black hover:border-gold hover:bg-gold hover:text-white"
						>
							<BrandIcon name="whatsapp" className="size-4" />
							{c.ctaWhatsappButton}
						</a>
						{c.ctaShop.href ? (
							<Link href={c.ctaShop.href} className="btn border-white text-white hover:bg-white hover:text-black">
								{c.ctaShop.label}
							</Link>
						) : null}
					</div>
				</div>
			</section>
		</>
	);
}
