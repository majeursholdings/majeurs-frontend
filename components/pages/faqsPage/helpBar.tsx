import Link from "next/link";

const links = [
	{ label: "Contact us", href: "/contact-majeurs-holdings/" },
	{ label: "FAQ", href: "/faqs/" },
	{ label: "Product care", href: "/furniture-care-service/" },
];

/** "Need help?" strip under the hero on the FAQ and Contact pages */
export function HelpBar() {
	return (
		<div className="border-b border-sand px-2.5 md:px-5">
			<div className="container-site flex flex-wrap items-center justify-between gap-3 py-4">
				<p className="text-xs uppercase tracking-button text-black">Need help?</p>
				<ul className="flex flex-wrap items-center text-xs uppercase tracking-button">
					{links.map((l) => (
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
