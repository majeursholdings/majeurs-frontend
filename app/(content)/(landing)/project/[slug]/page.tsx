import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProjectPage from "@/components/pages/projectPage";
import { getProject } from "@/lib/api/projects";
import { titleFromSlug } from "@/lib/routes/format";
import { projectSlugs } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

// TODO: fetch slugs from /wp-json/wp/v2/project instead of the snapshot
export function generateStaticParams() {
	return projectSlugs.map((slug) => ({ slug }));
}

/** Rank Math head for the project (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/project/[slug]">): Promise<Metadata> {
	const p = await params;
	const project = await getProject(p.slug);
	if (!project) return { title: titleFromSlug(p.slug) };
	return seoMetadata(project.href, {
		title: project.title,
		description: project.description.slice(0, 160) || undefined,
		alternates: { canonical: project.href },
		openGraph: {
			title: project.title,
			description: project.description.slice(0, 200) || undefined,
			url: project.href,
			images: project.image ? [{ url: project.image.src, alt: project.image.alt }] : undefined,
		},
	});
}

/** URL params are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params }: PageProps<"/project/[slug]">) {
	return (
		<Suspense fallback={<div className="min-h-60 animate-pulse bg-ink md:min-h-82" aria-label="Loading project" />}>
			<Content params={params} />
		</Suspense>
	);
}

async function Content({ params }: Pick<PageProps<"/project/[slug]">, "params">) {
	const p = await params;
	const project = await getProject(p.slug);
	if (!project) notFound();
	return (
		<>
			<SeoSchema path={project.href} />
			<ProjectPage project={project} />
		</>
	);
}
