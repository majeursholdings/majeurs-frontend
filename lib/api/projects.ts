import { cacheLife, cacheTag } from "next/cache";
import { WP_API, decodeEntities, wpFetch, WpError } from "./wp";

type WpTerm = { id: number; name: string; slug: string; taxonomy: string };

type WpProject = {
	id: number;
	slug: string;
	date: string;
	title: { rendered: string };
	content: { rendered: string };
	featured_media: number;
	_embedded?: {
		"wp:featuredmedia"?: { source_url: string; alt_text?: string }[];
		"wp:term"?: WpTerm[][];
	};
};

type WpMedia = { id: number; source_url: string; alt_text: string; media_details?: { width?: number; height?: number } };

export type ProjectImage = { src: string; alt: string; width: number; height: number };

/** Archive card */
export type ProjectSummary = { slug: string; title: string; href: string; image?: { src: string; alt: string } };

export type ProjectDetail = ProjectSummary & {
	id: number;
	/** ISO date */
	date: string;
	/** Plain text from the WP content, for the meta description */
	description: string;
	/** project-client-industry / project-location / project-year taxonomies */
	industry: string[];
	locations: string[];
	years: string[];
	/** Images attached to the project, newest first (the live page order), without the featured image */
	gallery: ProjectImage[];
};

const plainText = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function terms(project: WpProject, taxonomy: string): string[] {
	return (project._embedded?.["wp:term"] ?? [])
		.flat()
		.filter((t) => t.taxonomy === taxonomy)
		.map((t) => decodeEntities(t.name));
}

function toSummary(project: WpProject): ProjectSummary {
	const title = decodeEntities(project.title.rendered);
	const media = project._embedded?.["wp:featuredmedia"]?.[0];
	return {
		slug: project.slug,
		title,
		href: `/project/${project.slug}/`,
		image: media ? { src: media.source_url, alt: decodeEntities(media.alt_text || title) } : undefined,
	};
}

/** Every published project, newest first. Cached an hour, tagged "project-list". */
export async function getProjects(): Promise<ProjectSummary[]> {
	"use cache";
	cacheLife("hours");
	cacheTag("project-list");

	const query = new URLSearchParams({ per_page: "100", _embed: "wp:featuredmedia", _fields: "slug,title,_links,_embedded" });
	const res = await wpFetch(`${WP_API}/project?${query}`);
	if (!res.ok) throw new WpError(res.status, `WP API /project`);
	const projects: WpProject[] = await res.json();
	return projects.map(toSummary);
}

/** One project by slug with its taxonomies and gallery, or null. Cached an hour, tagged "project:<slug>". */
export async function getProject(slug: string): Promise<ProjectDetail | null> {
	"use cache";
	cacheLife("hours");
	cacheTag(`project:${slug}`, "project-list");

	const query = new URLSearchParams({
		slug,
		_embed: "wp:featuredmedia,wp:term",
		_fields: "id,slug,date,title,content,featured_media,_links,_embedded",
	});
	const res = await wpFetch(`${WP_API}/project?${query}`);
	if (!res.ok) throw new WpError(res.status, `WP API /project?slug=${slug}`);
	const [project]: WpProject[] = await res.json();
	if (!project) return null;

	// the gallery is the media uploaded to the project (WP "Uploaded to this post")
	const mediaRes = await wpFetch(`${WP_API}/media?parent=${project.id}&per_page=100&orderby=id&order=desc&_fields=id,source_url,alt_text,media_details`);
	const media: WpMedia[] = mediaRes.ok ? await mediaRes.json() : [];
	const summary = toSummary(project);

	return {
		...summary,
		id: project.id,
		date: project.date,
		description: plainText(project.content.rendered),
		industry: terms(project, "project-client-industry"),
		locations: terms(project, "project-location"),
		years: terms(project, "project-year"),
		gallery: media
			.filter((m) => m.id !== project.featured_media)
			.map((m) => ({
				src: m.source_url,
				alt: decodeEntities(m.alt_text || summary.title),
				width: m.media_details?.width ?? 2000,
				height: m.media_details?.height ?? 1333,
			})),
	};
}
