import { TextLink } from "@/components/landing/ctaLink";

/** A line under the title of the sofa categories (sofas and its 2-, 3-, 4-seater and L-shaped children) pointing to the journal's size guide */
export function SofaSizeGuideNote() {
	return (
		<div className="container-site flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 pt-8 text-sm text-charcoal">
			<p>Not sure which size fits?</p>
			<TextLink cta={{ label: "Read our sofa size guide for Lagos living rooms", href: "/sofa-size-guide/" }} />
		</div>
	);
}
