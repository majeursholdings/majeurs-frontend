import Link from "next/link";
import dayjs from "dayjs";
import { cacheLife } from "next/cache";
import type { Contact } from "@/lib/contact";
import { footerColumns, type NavLink } from "@/lib/navigation";

/**
 * Site footer, matching the WP footer: black block with four link columns
 * (Shop, Discover, Company, Policies), then a darker bar with social links (wp-admin > Site content > Contact details)
 * and the copyright.
 */
export function Footer({ contact }: { contact: Contact }) {
	return (
		<footer className="bg-black text-sand">
			<div className="container-site grid grid-cols-1 gap-x-8 gap-y-10 py-12.5 sm:grid-cols-2 lg:grid-cols-4">
				{footerColumns.map((col) => (
					<nav key={col.title} aria-label={col.title}>
						<h2 className="mb-5 text-sm font-bold uppercase tracking-button text-white">
							{col.title}
						</h2>

						<ul className="space-y-3">
							{col.links.map((link) => (
								<li key={link.href}>
									<FooterLink 
										link={link} 
										className="text-sm tracking-button text-grey hover:text-gold" />
								</li>
							))}
						</ul>
					</nav>
				))}
			</div>

			<div className="bg-night">
				<div className="container-site flex flex-col gap-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
					<ul className="flex flex-wrap gap-x-5 gap-y-2">
						{contact.socials.map((s) => (
							<li key={s.href}>
								<FooterLink link={{ label: s.label, href: s.href, external: true }} className="text-[10px] uppercase tracking-button text-sand hover:text-gold" />
							</li>
						))}
					</ul>
					<p className="text-[10px] uppercase tracking-button text-sand">
						© <CopyrightYear /> Majeurs Holdings. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}

function FooterLink({ link, className }: { link: NavLink; className: string }) {
	if (link.external) {
		return (
			<a href={link.href} target="_blank" rel="noopener noreferrer" className={`transition-colors ${className}`}>
				{link.label}
			</a>
		);
	}
	return (
		<Link href={link.href} className={`transition-colors ${className}`}>
			{link.label}
		</Link>
	);
}

/** Cached so the footer can prerender (cacheComponents doesn't allow reading the clock outside a cache). */
async function CopyrightYear() {
	"use cache";
	cacheLife("days");
	return dayjs().year();
}

export default Footer;
