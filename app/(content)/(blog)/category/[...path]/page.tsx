import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BlogSidebar } from "@/components/blog/blogSidebar";
import { PostArchive, PostArchiveSkeleton } from "@/components/blog/postArchive";
import { DEFAULT_HERO_IMAGE, PageHero } from "@/components/common/pageHero";
import { CustomizeCta } from "@/components/marketing/customizeCta";
import { getPostCategories, getPosts } from "@/lib/api/posts";
import { splitPagination, titleFromSlug } from "@/lib/routes/format";
import { blogCategorySlugs } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

/** Blog category archive. Also receives pagination: /category/<slug>/page/2/ */
export function generateStaticParams() {
	return blogCategorySlugs.map((slug) => ({ path: [slug] }));
}

/** Rank Math head for the archive page (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/category/[...path]">): Promise<Metadata> {
	const p = await params;
	const { path, page } = splitPagination(p.path);
	const slug = path.at(-1) ?? "";
	const category = (await getPostCategories()).find((c) => c.slug === slug);
	const name = category?.name ?? titleFromSlug(slug);
	const url = `/category/${path.join("/")}/${page > 1 ? `page/${page}/` : ""}`;
	return seoMetadata(url, {
		title: page > 1 ? `${name} – page ${page}` : name,
		description: category?.description || undefined,
		alternates: { canonical: url },
	});
}

/**
 * The category and page are checked before <Suspense> so an unknown one is a real 404 (notFound() mid-stream sends
 * 200 + noindex). The lookups are cached, so Hero and Content reuse them.
 */
export default async function Page({ params }: PageProps<"/category/[...path]">) {
	const { category, page } = await findCategory(params);
	if (page > 1 && !(await getPosts({ page, category: category.id })).posts.length) notFound();
	return (
		<>
			<Suspense fallback={<PageHero className="col-full" title="Category" />}>
				<Hero params={params} />
			</Suspense>
			<div className="col-main">
				<Suspense fallback={<PostArchiveSkeleton />}>
					<Content params={params} />
				</Suspense>
			</div>
			<aside aria-label="Blog" className="col-aside">
				<BlogSidebar />
			</aside>
			<CustomizeCta className="col-full" image={DEFAULT_HERO_IMAGE} fullBleed />
		</>
	);
}

async function findCategory(params: PageProps<"/category/[...path]">["params"]) {
	const [p, categories] = await Promise.all([params, getPostCategories()]);
	const { path, page } = splitPagination(p.path);
	const category = categories.find((c) => c.slug === path.at(-1));
	if (!category) notFound();
	return { category, page, basePath: `/category/${path.join("/")}/` };
}

async function Hero({ params }: Pick<PageProps<"/category/[...path]">, "params">) {
	const { category } = await findCategory(params);
	return <PageHero className="col-full" title={`Category: ${category.name}`} />;
}

async function Content({ params }: Pick<PageProps<"/category/[...path]">, "params">) {
	const { category, page, basePath } = await findCategory(params);
	return (
		<>
			<SeoSchema path={page > 1 ? `${basePath}page/${page}/` : basePath} />
			<PostArchive page={page} basePath={basePath} category={category.id} />
		</>
	);
}
