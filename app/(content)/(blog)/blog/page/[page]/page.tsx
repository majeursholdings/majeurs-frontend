import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { BlogIndex } from "@/components/blog/blogIndex";
import { SeoSchema } from "@/components/common/seoSchema";
import { getPosts } from "@/lib/api/posts";
import { seoMetadata } from "@/lib/seo";

/** Rank Math head for the archive page (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/blog/page/[page]">): Promise<Metadata> {
	const p = await params;
	// WP canonical: /blog/page/1/ is /blog/
	const path = Number(p.page) > 1 ? `/blog/page/${p.page}/` : "/blog/";
	return seoMetadata(path, { title: `Blog – page ${p.page}`, alternates: { canonical: path } });
}

/** A sample page lets Page await params before <Suspense> (cacheComponents); other pages render on first request */
export function generateStaticParams() {
	return [{ page: "2" }];
}

/**
 * The page number is checked before <Suspense> so a bad one is a real 404 and page 1 a real redirect (mid-stream they
 * become 200 + noindex and a client-side redirect). getPosts is cached, so the archive reuses the result.
 */
export default async function Page({ params }: PageProps<"/blog/page/[page]">) {
	const p = await params;
	if (!/^\d+$/.test(p.page)) notFound();
	// WP canonical: /blog/page/1/ is /blog/
	if (Number(p.page) <= 1) permanentRedirect("/blog/");
	if (!(await getPosts({ page: Number(p.page) })).posts.length) notFound();
	return (
		<Suspense fallback={null}>
			<Content params={params} />
		</Suspense>
	);
}

async function Content({ params }: Pick<PageProps<"/blog/page/[page]">, "params">) {
	const p = await params;
	return (
		<>
			<SeoSchema path={`/blog/page/${p.page}/`} />
			<BlogIndex page={Number(p.page)} />
		</>
	);
}
