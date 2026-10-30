import Link from "next/link";
import { getSiteContent } from "@/lib/content/get";
import { helpBarContent } from "@/lib/content/site";

/** "Need help?" strip under the hero on the FAQ and Contact pages */
export async function HelpBar() {
	const c = await getSiteContent(helpBarContent);
	return (
		<div className="border-b border-sand px-2.5 md:px-5">
			<div className="container-site flex flex-wrap items-center justify-between gap-3 py-4">
				<p className="text-xs uppercase tracking-button text-black">{c.label}</p>
				<ul className="flex flex-wrap items-center text-xs uppercase tracking-button">
					{c.links.map(({ cta: l }) => (
						<li key={l.href} className="border-l border-sand px-3 first:border-0 first:pl-0 last:pr-0 md:px-4">
							<Link href={l.href} className="text-bronze underline underline-offset-4 hover:text-gold">
								{l.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export default HelpBar;
