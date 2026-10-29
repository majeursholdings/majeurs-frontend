import type { Metadata } from "next";
import { Suspense } from "react";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { PageHero } from "@/components/common/pageHero";
import { ProductArchive, ProductArchiveSkeleton } from "@/components/shop/productArchive";
import { BlogCard } from "@/components/common/blogCard";
import { Pagination } from "@/components/shop/pagination";
import { getPosts } from "@/lib/api/posts";
import { parseFilters } from "@/lib/shopFilters";
import { toSort } from "@/lib/shopSort";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/search/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, { title: page.title }, { robots: { index: false, follow: false } });
}

/** /search/?q=sofa&paged=2 (WP's /?s= is redirected here in proxy.ts); the blog sidebar adds &type=post */
export default function Page({ searchParams }: PageProps<"/search">) {
	return (
		<Suspense fallback={<ProductArchiveSkeleton />}>
			<Content searchParams={searchParams} />
		</Suspense>
	);
}

async function Content({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
	const query = await searchParams;
	const { q, orderby, paged, type } = query;
	const search = (typeof q === "string" ? q : "").trim().slice(0, 100);
	const pageNumber = Math.max(1, Number(paged) || 1);

	if (type === "post") return <PostResults search={search} page={pageNumber} />;

	return (
		<>
			<PageHero title={search ? `Search results for “${search}”` : "Search"} />
			<ProductArchive page={pageNumber} sort={toSort(orderby)} filters={parseFilters(query)} search={search || undefined} basePath="/search/" pageParam="paged" />
		</>
	);
}

/** Blog search results, same 3-up cards as /blog/ */
async function PostResults({ search, page }: { search: string; page: number }) {
	const { posts, total, totalPages } = search ? await getPosts({ search, page }) : { posts: [], total: 0, totalPages: 0 };
	return (
		<>
			<PageHero title={search ? `Blog results for “${search}”` : "Search the blog"} />
			<div className="container-site space-y-8 px-2.5 py-12.5 md:px-5 lg:py-20">
				<p className="text-xs text-charcoal">{total ? `${total} post${total === 1 ? "" : "s"} found` : "No posts matched your search."}</p>
				<div className="grid gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<BlogCard key={post.href} {...post} />
					))}
				</div>
				<Pagination page={page} totalPages={totalPages} basePath="/search/" query={new URLSearchParams({ q: search, type: "post" }).toString()} queryParam="paged" />
			</div>
		</>
	);
}
