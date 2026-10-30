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
