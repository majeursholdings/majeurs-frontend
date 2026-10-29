import { cacheLife, cacheTag } from "next/cache";
import { WP_API, decodeEntities } from "./wp";

type WpCareer = {
	id: number;
	slug: string;
	date: string;
	title: { rendered: string };
	content: { rendered: string };
	_embedded?: {
		"wp:featuredmedia"?: { source_url: string; alt_text?: string }[];
		"wp:term"?: { name: string; slug: string; taxonomy: string }[][];
	};
};

export type Job = {
	id: number;
	slug: string;
	title: string;
	/** ISO date the opening was posted */
	date: string;
	/** "job-status" taxonomy: Open / Close */
	open: boolean;
	contractType: string;
	location: string;
	/** ISO date (YYYY-MM-DD), when known */
	closingDate?: string;
	image?: string;
	/** WP editor HTML (trusted: written by Majeurs staff in wp-admin) */
	content: string;
	excerpt: string;
};

/**
 * Contract type and closing date live in custom fields the REST API doesn't expose (copied from the live
 * job pages, 28 Oct 2026). TODO: show those fields in REST (ACF "Show in REST API") and read them here.
 */
const JOB_DETAILS: Record<string, { contractType: string; closingDate?: string }> = {
	"nysc-procurement-officer": { contractType: "NYSC Placement" },
	"group-general-manager-head-of-company-operations-performance": { contractType: "Full-time", closingDate: "2026-06-30" },
	"lead-conversion-executive": { contractType: "Full-time", closingDate: "2026-06-30" },
	"head-of-academy-growth": { contractType: "Full-time", closingDate: "2026-06-30" },
	"welding-and-fabrication-lead-craft-instructor": { contractType: "Full-time", closingDate: "2026-04-30" },
	"upholstery-lead-craft-instructor": { contractType: "Full-time", closingDate: "2026-04-30" },
	"technical-drawing-instructor": { contractType: "Full-time", closingDate: "2026-04-30" },
	"furniture-and-woodwork-lead-craft-instructor": { contractType: "Full-time", closingDate: "2026-04-01" },
	"lead-generation-and-digital-marketing-lead": { contractType: "Hybrid", closingDate: "2026-03-27" },
};

const plainText = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function toJob(post: WpCareer): Job {
	const terms = (post._embedded?.["wp:term"] ?? []).flat();
	const status = terms.find((t) => t.taxonomy === "job-status");
	const details = JOB_DETAILS[post.slug];
	const content = post.content.rendered;
	return {
		id: post.id,
		slug: post.slug,
		title: decodeEntities(post.title.rendered),
		date: post.date,
		open: status ? status.slug === "open" : true,
		contractType: details?.contractType ?? "Full-time",
		location: "Lagos",
		closingDate: details?.closingDate,
		image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
		// majeurs.com blocks hotlinked uploads by Referer, so editor images load without one
		content: content.replace(/<img /g, '<img referrerpolicy="no-referrer" loading="lazy" '),
		excerpt: plainText(content).slice(0, 200),
	};
}

/** Every opening, newest first. Cached an hour, tagged "careers". */
export async function getJobs(): Promise<Job[]> {
	"use cache";
	cacheLife("hours");
	cacheTag("careers");

	const res = await fetch(`${WP_API}/career?per_page=100&_embed=wp:featuredmedia,wp:term&_fields=id,slug,date,title,content,_links,_embedded`);
	if (!res.ok) throw new Error(`WP API ${res.status} for /career`);
	const posts: WpCareer[] = await res.json();
	return posts.map(toJob);
}

/** One opening by slug, or null. Cached an hour, tagged "career:<slug>". */
export async function getJob(slug: string): Promise<Job | null> {
	"use cache";
	cacheLife("hours");
	cacheTag(`career:${slug}`, "careers");

	const res = await fetch(`${WP_API}/career?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,wp:term&_fields=id,slug,date,title,content,_links,_embedded`);
	if (!res.ok) throw new Error(`WP API ${res.status} for /career?slug=${slug}`);
	const [post]: WpCareer[] = await res.json();
	return post ? toJob(post) : null;
}
