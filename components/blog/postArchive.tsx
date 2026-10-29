import { notFound } from "next/navigation";
import { BlogCard } from "@/components/common/blogCard";
import { Pagination } from "@/components/shop/pagination";
import { getPosts } from "@/lib/api/posts";

type PostArchiveProps = {
	page: number;
	/** Archive root for pagination links, e.g. "/blog/" or "/category/design/" */
	basePath: string;
	/** WP category id */
	category?: number;
};

/** Blog grid (3 across on desktop) + pagination, for /blog/ and /category/<slug>/ */
export async function PostArchive({ page, basePath, category }: PostArchiveProps) {
	const { posts, totalPages } = await getPosts({ page, category });
	if (page > 1 && !posts.length) notFound();

	if (!posts.length) return <p className="text-sm text-charcoal">No posts yet. Check back soon.</p>;

	return (
		<>
			<div className="grid gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
				{posts.map((post) => (
					<BlogCard key={post.href} {...post} />
				))}
			</div>
			<Pagination page={page} totalPages={totalPages} basePath={basePath} />
		</>
	);
}

export function PostArchiveSkeleton() {
	return (
		<div className="grid gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading posts">
			{Array.from({ length: 6 }, (_, i) => (
				<div key={i} className="space-y-4">
					<div className="aspect-4/3 animate-pulse bg-sand-50" />
					<div className="h-3 w-1/3 animate-pulse bg-sand-50" />
					<div className="h-4 w-3/4 animate-pulse bg-sand-50" />
				</div>
			))}
		</div>
	);
}
