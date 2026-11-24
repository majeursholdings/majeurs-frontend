import { MoveRight } from "lucide-react";
import Link from "next/link";
import type { Cta } from "@/lib/content/model";

export const buttonStyles = {
	primary: "btn border-black bg-black text-white hover:border-gold hover:bg-gold",
	outline: "btn border-black text-black hover:bg-black hover:text-white",
	/** on dark photos and bands */
	light: "btn border-white bg-white text-black hover:border-gold hover:bg-gold hover:text-white",
	outlineLight: "btn border-white text-white hover:bg-white hover:text-black",
	small: "btn px-4 py-2 text-xs border-black text-black hover:bg-black hover:text-white",
};

/** A button from a page's link field; renders nothing when the editor left the URL empty */
export function CtaLink({ cta, className }: { cta: Cta; className: string }) {
	if (!cta.href) return null;
	return cta.external ? (
		<a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
			{cta.label}
		</a>
	) : (
		<Link href={cta.href} className={className}>
			{cta.label}
		</Link>
	);
}

/** A text link in the site's bronze link style with a small arrow (as in productCare.tsx), for a line of copy rather than a button; renders nothing when the URL is empty */
export function TextLink({ cta }: { cta: Cta }) {
	if (!cta.href) return null;
	const className = "group inline-flex items-center gap-2 text-bronze underline-offset-4 hover:underline";
	const label = (
		<>
			{cta.label}
			<MoveRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
		</>
	);
	return cta.external ? (
		<a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
			{label}
		</a>
	) : (
		<Link href={cta.href} className={className}>
			{label}
		</Link>
	);
}
