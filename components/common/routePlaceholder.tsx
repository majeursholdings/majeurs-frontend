import Link from "next/link";

type RoutePlaceholderProps = {
	title: string;
	/** Path on the live WordPress site this route replaces */
	wpPath: string;
	phase?: number;
	note?: string;
	/** Extra info, e.g. the dynamic slug */
	detail?: string;
	/**
	 * "page" = standalone (own container + h1), for routes without a hero yet.
	 * "inline" = dashed box inside a layout that already has a hero/title.
	 */
	variant?: "page" | "inline";
};

/**
 * Temporary content for routes that exist (so nothing 404s) but aren't built yet.
 * Search the codebase for <RoutePlaceholder to see what's left.
 */
export function RoutePlaceholder({ title, wpPath, phase, note, detail, variant = "page" }: RoutePlaceholderProps) {
	const body = (
		<>
			<p className="eyebrow">{phase ? `Phase ${phase} · ` : ""}Not built yet</p>
			{variant === "page" ? <h1>{title}</h1> : <p className="text-lg text-black">{title}</p>}
			{detail ? <p className="text-muted-foreground">{detail}</p> : null}
			<p className="text-sm text-muted-foreground">
				Replaces{" "}
				<Link href={`https://majeurs.com${wpPath}`} className="text-bronze underline" target="_blank">
					majeurs.com{wpPath}
				</Link>
			</p>
			{note ? <p className="text-sm text-charcoal">Note: {note}</p> : null}
		</>
	);

	if (variant === "inline") {
		return <div className="space-y-3 border border-dashed border-grey p-8">{body}</div>;
	}

	return <section className="container-site space-y-4 py-16 md:py-24">{body}</section>;
}

export default RoutePlaceholder;
