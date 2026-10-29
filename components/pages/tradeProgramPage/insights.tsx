import Link from "next/link";
import { MoveRight } from "lucide-react";
import { BlogCard } from "@/components/common/blogCard";
import { getPostCategories, getPosts } from "@/lib/api/posts";

/** "Insights for specifiers": the three newest Trade Program posts (cached, tagged "post-list") */
export async function TradeInsights() {
	const category = (await getPostCategories()).find((c) => c.slug === "trade-program");
	const { posts } = await getPosts({ category: category?.id, perPage: 3 });
	if (!posts.length) return null;

	return (
		<section className="px-2.5 py-12.5 md:px-5 md:py-24">
			<div className="container-site space-y-10">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="max-w-xl space-y-3">
						<p className="eyebrow">Stay updated</p>
						<h2 className="text-h3 font-display">Insights for specifiers</h2>
						<p className="text-sm text-charcoal">Guides and updates for designers, developers and hospitality teams working with Majeurs.</p>
					</div>
					<Link href="/category/trade-program/" className="btn group border-black text-black hover:bg-black hover:text-white">
						Visit the journal
						<MoveRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
					</Link>
				</div>
				<div className="grid gap-x-5 gap-y-10 md:grid-cols-3">
					{posts.map((post) => (
						<BlogCard key={post.href} {...post} />
					))}
				</div>
			</div>
		</section>
	);
}
