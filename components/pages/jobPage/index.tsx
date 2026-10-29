import Link from "next/link";
import dayjs from "dayjs";
import { Mail } from "lucide-react";
import { BrandIcon, type BrandIconName } from "@/components/common/brandIcons";
import { PageHero } from "@/components/common/pageHero";
import type { Job } from "@/lib/api/careers";
import { cn } from "@/lib/utils";
import { ApplyForm } from "./applyForm";

const label = "mb-1.5 text-xs uppercase tracking-button text-black";

/** /career/<slug>/: hero, meta column + job description, then the application form (or a closed notice) */
export default function JobPage({ job, url }: { job: Job; url: string }) {
	return (
		<>
			<PageHero className="min-h-60 md:min-h-82" title={job.title} image={job.image} overlayClassName="bg-black/65">
				{job.closingDate ? <p className="text-xs text-sand">Closing date: {dayjs(job.closingDate).format("MMMM D, YYYY")}</p> : null}
				<a href="#apply" className="btn mt-2 border-white bg-white text-black hover:bg-black hover:text-white">
					{job.open ? "Apply now" : "Role closed"}
				</a>
			</PageHero>

			<section className="px-2.5 py-12.5 md:px-5 md:py-20">
				<div className="container-site grid gap-10 lg:grid-cols-[16.25rem_1fr] lg:gap-5">
					{/* one meta column (the live page repeats it) */}
					<aside className="space-y-6 lg:sticky lg:top-28 lg:self-start lg:pr-5">
						<div className="border-b border-sand pb-5">
							<p className={label}>Opening status</p>
							<p className={cn("text-sm", job.open ? "text-gold" : "text-grey")}>{job.open ? "Open" : "Closed"}</p>
						</div>
						<div className="border-b border-sand pb-5">
							<p className={label}>Contract type</p>
							<p className="text-sm text-charcoal">{job.contractType}</p>
						</div>
						<div className="border-b border-sand pb-5">
							<p className={label}>Location</p>
							<p className="text-sm text-charcoal">{job.location}</p>
						</div>
						<div className="border-b border-sand pb-5">
							<p className={`${label} mb-3`}>Share page</p>
							<ShareLinks title={job.title} url={url} />
						</div>
						<div className="space-y-3">
							<p className={label}>View more openings</p>
							<Link href="/career/#openings" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
								View openings
							</Link>
						</div>
					</aside>

					<div className="min-w-0 space-y-8 lg:border-l lg:border-sand lg:pl-5">
						{/* WP editor content, written by Majeurs staff in wp-admin */}
						<article
							className="prose-majeurs text-sm text-charcoal [&_h2]:text-h4 [&_h2]:text-black [&_h3]:text-lg [&_h3]:text-black [&_h4]:text-base [&_h4]:text-black [&_img]:h-auto [&_img]:w-full"
							dangerouslySetInnerHTML={{ __html: job.content }}
						/>
						{job.open ? (
							<a href="#apply" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
								Apply now
							</a>
						) : null}
					</div>
				</div>
			</section>

			<section id="apply" className="scroll-mt-24 bg-sand px-2.5 py-14 md:px-5 md:py-20">
				<div className="mx-auto max-w-3xl">
					{job.open ? (
						<div className="space-y-8 bg-white p-6 md:p-10">
							<div className="space-y-2">
								<p className="eyebrow">Apply</p>
								<h2 className="font-display text-h3">Apply for this role</h2>
							</div>
							<ApplyForm role={job.title} />
						</div>
					) : (
						<div className="space-y-4 bg-white p-6 text-center md:p-10">
							<h2 className="font-display text-h4">This role is closed</h2>
							<p className="text-sm text-charcoal">We&apos;re no longer accepting applications for {job.title}. See our other openings.</p>
							<Link href="/career/#openings" className="btn border-black bg-black text-white hover:border-gold hover:bg-gold">
								View openings
							</Link>
						</div>
					)}
				</div>
			</section>
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
