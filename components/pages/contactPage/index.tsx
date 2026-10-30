import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { PageHero } from "@/components/common/pageHero";
import { HelpBar } from "@/components/pages/faqsPage/helpBar";
import { SocialLinks } from "@/components/pages/faqsPage/socialLinks";
import { ContactForm } from "./contactForm";
import { WP_URL } from "@/lib/api/wp";

type Line = { icon: LucideIcon; text: string; href: string };

const maps = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const HQ = "32, QMB Builders Mart Road, Opposite Elf Bus Stop, Lekki Phase 1, Lagos State, Nigeria. 105102";
const UK = "71–75 Shelton Street, Covent Garden, London, WC2H 9JQ";

/** Contact details as on the live page */
const groups: { title: string; lines: Line[] }[] = [
	{
		title: "Corporate headquarters",
		lines: [
			{ icon: MapPin, text: HQ, href: maps(HQ) },
			{ icon: Phone, text: "+234 201 330 6192", href: "tel:+2342013306192" },
		],
	},
	{
		title: "United Kingdom office",
		lines: [
			{ icon: MapPin, text: UK, href: maps(UK) },
			{ icon: Phone, text: "+44 7936 520391", href: "tel:+447936520391" },
		],
	},
	{
		title: "Customer service",
		lines: [
			{ icon: Mail, text: "customerservice@majeursholdings.com", href: "mailto:customerservice@majeursholdings.com" },
			{ icon: Phone, text: "+234 906 599 2520", href: "tel:+2349065992520" },
		],
	},
	{
		title: "Partnership",
		lines: [
			{ icon: Mail, text: "b.strategy@majeursholdings.com", href: "mailto:b.strategy@majeursholdings.com" },
			{ icon: Phone, text: "+234 201 330 6192", href: "tel:+2342013306192" },
		],
	},
];

/** /contact-majeurs-holdings/: wood hero, "Need help?" bar, contact details on the left, enquiry form on the right */
export default function ContactPage() {
	return (
		<>
			<PageHero title="Contact Majeurs" image={`${WP_URL}/wp-content/uploads/wood-skin-1.webp`} overlayClassName="bg-black/30" />
			<HelpBar />

			<div className="px-2.5 py-12.5 md:px-5 md:py-16">
				<div className="container-site grid max-w-[1100px] gap-10 lg:grid-cols-[290px_1fr] lg:gap-0">
					<div className="space-y-8 lg:border-r lg:border-sand lg:pr-6">
						{groups.map((g) => (
							<div key={g.title} className="space-y-3">
								<h2 className="text-sm uppercase tracking-button text-black">{g.title}</h2>
								<ul className="space-y-2.5">
									{g.lines.map((l) => (
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
							<h2 className="text-sm uppercase tracking-button text-black">Social media</h2>
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
