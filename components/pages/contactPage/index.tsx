import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { HelpBar } from "@/components/pages/faqsPage/helpBar";
import { SocialLinks } from "@/components/pages/faqsPage/socialLinks";
import { getPageContent } from "@/lib/content/get";
import { contact } from "@/lib/content/pages/contact";
import { ContactForm } from "./contactForm";

type Line = { icon: LucideIcon; text: string; href: string };

const maps = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** A contact group's address, email and phone, each shown only when filled in */
const linesOf = (g: { address: string; email: string; phone: string }): Line[] =>
	[
		g.address && { icon: MapPin, text: g.address, href: maps(g.address) },
		g.email && { icon: Mail, text: g.email, href: `mailto:${g.email}` },
		g.phone && { icon: Phone, text: g.phone, href: `tel:${g.phone.replace(/[^\d+]/g, "")}` },
	].filter((l): l is Line => !!l);

/**
 * /contact-majeurs-holdings/: wood hero, "Need help?" bar, contact details on the left, enquiry form on the right.
 * Copy and images from the page's fields in wp-admin (lib/content/pages/contact.ts)
 */
export default async function ContactPage() {
	const c = await getPageContent(contact);
	return (
		<>
			<PageHero title={c.heroTitle} image={c.heroImage} overlayClassName="bg-black/30" />
			<HelpBar />

			<div className="px-2.5 py-12.5 md:px-5 md:py-16">
				<div className="container-site grid max-w-[1100px] gap-10 lg:grid-cols-[290px_1fr] lg:gap-0">
					<div className="space-y-8 lg:border-r lg:border-sand lg:pr-6">
						{c.offices.map((g) => (
							<div key={g.title} className="space-y-3">
								<h2 className="text-sm uppercase tracking-button text-black">{g.title}</h2>
								<ul className="space-y-2.5">
									{linesOf(g).map((l) => (
										<li key={l.text}>
											<a
												href={l.href}
												{...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
												className="flex gap-3 text-sm text-ink underline underline-offset-4 hover:text-gold [overflow-wrap:anywhere]"
											>
												<l.icon className="mt-1 size-3.5 shrink-0" aria-hidden />
												{l.text}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
						<div className="space-y-3">
							<h2 className="text-sm uppercase tracking-button text-black">{c.socialTitle}</h2>
							<SocialLinks />
						</div>
					</div>

					<div className="min-w-0 lg:pl-6">
						<ContactForm />
					</div>
				</div>
			</div>
		</>
	);
}
