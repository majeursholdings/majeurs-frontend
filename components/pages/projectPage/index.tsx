import Link from "next/link";
import dayjs from "dayjs";
import { Building2, CalendarDays, Mail, MapPin, type LucideIcon } from "lucide-react";
import { BrandIcon, type BrandIconName } from "@/components/common/brandIcons";
import { DEFAULT_HERO_IMAGE, PageHero } from "@/components/common/pageHero";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import type { ProjectDetail } from "@/lib/api/projects";
import { SITE_URL } from "@/lib/contact";
import { ProjectGallery } from "./projectGallery";

const heading = "mb-3 text-xs uppercase tracking-button text-black";

/** /project/<slug>/: hero over the cover photo, meta column (industry, location, year, share), photo gallery */
export default function ProjectPage({ project }: { project: ProjectDetail }) {
	const url = `${SITE_URL}${project.href}`;
	const meta: { label: string; icon: LucideIcon; values: string[] }[] = [
		{ label: "Client industry", icon: Building2, values: project.industry },
		{ label: "Project locations", icon: MapPin, values: project.locations },
		{ label: "Project year", icon: CalendarDays, values: project.years },
	];

	return (
		<>
			<PageHero title={project.title} image={project.image?.src} className="min-h-60 md:min-h-82" overlayClassName="bg-black/55">
				<time dateTime={project.date} className="block pt-1 text-xs text-sand">
					{dayjs(project.date).format("MMMM D, YYYY")}
				</time>
			</PageHero>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid gap-10 lg:grid-cols-[16.25rem_1fr] lg:gap-0">
					<aside aria-label="Project details" className="lg:sticky lg:top-28 lg:self-start lg:pr-5">
						<dl className="divide-y divide-sand border-b border-sand">
							{meta
								.filter((m) => m.values.length)
								.map(({ label, icon: Icon, values }) => (
									<div key={label} className="py-4 first:pt-0">
										<dt className={heading}>{label}</dt>
										<dd className="flex items-center gap-2 text-xs text-gold-muted">
											<Icon className="size-4 shrink-0 text-black" strokeWidth={1.5} aria-hidden />
											{values.join(", ")}
										</dd>
									</div>
								))}
						</dl>
						<div className="border-b border-sand py-5">
							<p className={heading}>Share page</p>
							<ShareLinks title={project.title} url={url} />
						</div>
						<div className="py-5">
							<p className={heading}>View full catalogues</p>
							<Link href="/catalogue/" className="btn border-black bg-black px-6 py-2 text-xs text-white hover:border-gold hover:bg-gold">
								View catalogue
							</Link>
						</div>
					</aside>

					<div className="min-w-0 lg:border-l lg:border-sand lg:pl-5">
						{project.gallery.length ? (
							<ProjectGallery images={project.gallery} title={project.title} />
						) : (
							<p className="text-sm text-charcoal">{project.description}</p>
						)}
					</div>
				</div>
			</section>

			<CustomizeCta image={DEFAULT_HERO_IMAGE} fullBleed />
		</>
	);
}

function ShareLinks({ title, url }: { title: string; url: string }) {
	const u = encodeURIComponent(url);
	const t = encodeURIComponent(title);
	const links: { label: string; href: string; icon: BrandIconName | "mail" }[] = [
		{ label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: "facebook" },
		{ label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: "x" },
		{ label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: "linkedin" },
		{ label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, icon: "whatsapp" },
		{ label: "Email", href: `mailto:?subject=${t}&body=${u}`, icon: "mail" },
	];
	return (
		<ul className="flex gap-2">
			{links.map((l) => (
				<li key={l.label}>
					<a
						href={l.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Share on ${l.label}`}
						className="flex size-7 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gold"
					>
						{l.icon === "mail" ? <Mail className="size-3.5" aria-hidden /> : <BrandIcon name={l.icon} className="size-3.5" />}
					</a>
				</li>
			))}
		</ul>
	);
}
