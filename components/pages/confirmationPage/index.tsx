import Link from "next/link";
import { MoveRight, type LucideIcon } from "lucide-react";
import { getPageContent } from "@/lib/content/get";
import { paragraphs, type LinkField, type PageContent, type TextareaField, type TextField } from "@/lib/content/model";

export type ConfirmationFields = { eyebrow: TextField; title: TextField; message: TextareaField; cta: LinkField };

/**
 * Thank-you message inside the (confirmation) layout, which adds the shop / home buttons.
 * Copy from the page's fields in wp-admin (lib/content/pages/<id>.ts).
 */
export default async function ConfirmationPage({ page, icon: Icon }: { page: PageContent<ConfirmationFields>; icon: LucideIcon }) {
	const c = await getPageContent(page);
	return (
		<div className="space-y-5">
			<Icon className="mx-auto size-14 text-black" strokeWidth={1.25} aria-hidden />
			{c.eyebrow ? <p className="eyebrow">{c.eyebrow}</p> : null}
			<h1 className="text-h2 font-normal text-black">{c.title}</h1>
			{paragraphs(c.message).map((p) => (
				<p key={p} className="text-sm text-charcoal md:text-base">
					{p}
				</p>
			))}
			{c.cta.href ? (
				c.cta.external ? (
					<a href={c.cta.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-xs text-black hover:text-gold">
						{c.cta.label}
						<MoveRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
					</a>
				) : (
					<Link href={c.cta.href} className="group inline-flex items-center gap-2 text-xs text-black hover:text-gold">
						{c.cta.label}
						<MoveRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
					</Link>
				)
			) : null}
		</div>
	);
}
