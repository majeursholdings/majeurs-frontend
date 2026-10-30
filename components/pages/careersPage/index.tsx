import Link from "next/link";
import { getJobs, type Job } from "@/lib/api/careers";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { careers } from "@/lib/content/pages/careers";
import { cn } from "@/lib/utils";

/**
 * /career/: "Come Join Majeurs" intro, then every opening from the WP career post type.
 * Intro copy from the page's fields in wp-admin (lib/content/pages/careers.ts)
 */
export default async function CareersPage() {
	const [c, jobs] = await Promise.all([getPageContent(careers), getJobs()]);

	return (
		<>
			<section className="px-2.5 py-20 md:px-5 md:py-32">
				<div className="container-site space-y-5">
					<h1 className="font-display text-h1">{c.introTitle}</h1>
					<div className="max-w-xl space-y-2 text-sm text-charcoal">
						{paragraphs(c.introText).map((p) => (
							<p key={p}>{p}</p>
						))}
					</div>
					{c.introCta.href ? (
						<a
							href={c.introCta.href}
							{...(c.introCta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
							className="btn border-black bg-black text-white hover:border-gold hover:bg-gold"
						>
							{c.introCta.label}
						</a>
					) : null}
				</div>
			</section>

			<section id="openings" className="scroll-mt-24 bg-sand px-2.5 py-14 md:px-5 md:py-20">
				<div className="container-site space-y-6">
					<h2 className="font-display text-h3">{c.openingsTitle}</h2>
					{jobs.length ? (
						<ul>
							{jobs.map((job) => (
								<JobRow key={job.id} job={job} />
							))}
						</ul>
					) : (
						<p className="text-sm text-charcoal">{c.openingsEmpty}</p>
					)}
				</div>
			</section>
		</>
	);
}

function JobRow({ job }: { job: Job }) {
	return (
		<li className="flex flex-col gap-4 border-b border-grey/50 py-5 sm:flex-row sm:items-center sm:justify-between">
			<div className="space-y-1.5">
				<h3 className="font-display text-lg text-black">
					<Link href={`/career/${job.slug}/`} className="hover:text-gold">
						{job.title}
					</Link>
				</h3>
				<p className="flex flex-wrap items-center text-xs text-charcoal [&>span+span]:ml-2 [&>span+span]:border-l [&>span+span]:border-grey [&>span+span]:pl-2">
					<span>{job.contractType}</span>
					<span className={cn(job.open ? "text-gold" : "text-grey")}>{job.open ? "Open" : "Closed"}</span>
					<span>{job.location}</span>
				</p>
			</div>
			<Link
				href={`/career/${job.slug}/`}
				aria-label={`${job.open ? "Apply now" : "View role"}: ${job.title}`}
				className="btn w-fit shrink-0 border-black bg-black text-white hover:border-gold hover:bg-gold"
			>
				{job.open ? "Apply now" : "View role"}
			</Link>
		</li>
	);
}
