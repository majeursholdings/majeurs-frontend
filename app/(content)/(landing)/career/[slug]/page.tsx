import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import JobPage from "@/components/pages/jobPage";
import { getJob, type Job } from "@/lib/api/careers";
import { SITE_URL } from "@/lib/contact";
import { titleFromSlug } from "@/lib/routes/format";
import { careerSlugs } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

// TODO: fetch slugs from /wp-json/wp/v2/career instead of the snapshot
export function generateStaticParams() {
	return careerSlugs.map((slug) => ({ slug }));
}

/** Rank Math head for the job post (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/career/[slug]">): Promise<Metadata> {
	const p = await params;
	const job = await getJob(p.slug);
	if (!job) return { title: titleFromSlug(p.slug) };
	return seoMetadata(`/career/${job.slug}/`, {
		title: `${job.title} | Job Opening At Majeurs Holdings`,
		description: job.excerpt.slice(0, 160),
		alternates: { canonical: `/career/${job.slug}/` },
		openGraph: { title: job.title, description: job.excerpt.slice(0, 200), url: `/career/${job.slug}/`, images: job.image ? [{ url: job.image }] : undefined },
	});
}

/** URL params are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params }: PageProps<"/career/[slug]">) {
	return (
		<Suspense fallback={<div className="min-h-60 animate-pulse bg-ink md:min-h-82" aria-label="Loading role" />}>
			<Content params={params} />
		</Suspense>
	);
}

async function Content({ params }: Pick<PageProps<"/career/[slug]">, "params">) {
	const p = await params;
	const job = await getJob(p.slug);
	if (!job) notFound();
	const url = `${SITE_URL}/career/${job.slug}/`;

	return (
		<>
			<SeoSchema path={`/career/${job.slug}/`} fallback={jobSchema(job, url)} />
			<JobPage job={job} url={url} />
		</>
	);
}

const EMPLOYMENT_TYPES: Record<string, string> = { "Full-time": "FULL_TIME", "Part-time": "PART_TIME", "NYSC Placement": "INTERN", Hybrid: "FULL_TIME" };

function jobSchema(job: Job, url: string) {
	return {
		"@context": "https://schema.org",
		"@type": "JobPosting",
		title: job.title,
		description: job.content,
		url,
		datePosted: job.date,
		validThrough: job.closingDate,
		employmentType: EMPLOYMENT_TYPES[job.contractType] ?? "FULL_TIME",
		hiringOrganization: { "@type": "Organization", name: "Majeurs Holdings", sameAs: SITE_URL, logo: `${SITE_URL}/icon.png` },
		jobLocation: {
			"@type": "Place",
			address: { "@type": "PostalAddress", addressLocality: "Lagos", addressRegion: "Lagos", addressCountry: "NG" },
		},
	};
}
