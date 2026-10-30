import Link from "next/link";
import { MoveRight } from "lucide-react";
import { BlogCard } from "@/components/common/blogCard";
import { getPostCategories, getPosts } from "@/lib/api/posts";
import { paragraphs, type Cta } from "@/lib/content/model";

/** "Insights for specifiers": the three newest Trade Program posts (cached, tagged "post-list"), under the page's copy */
export async function TradeInsights({ eyebrow, title, text, cta }: { eyebrow: string; title: string; text: string; cta: Cta }) {
	const category = (await getPostCategories()).find((c) => c.slug === "trade-program");
	const { posts } = await getPosts({ category: category?.id, perPage: 3 });
	if (!posts.length) return null;

	return (
		<section className="px-2.5 py-12.5 md:px-5 md:py-24">
			<div className="container-site space-y-10">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div className="max-w-xl space-y-3">
						<p className="eyebrow">{eyebrow}</p>
						<h2 className="text-h3 font-display">{title}</h2>
						{paragraphs(text).map((p) => (
							<p key={p} className="text-sm text-charcoal">
								{p}
							</p>
						))}
					</div>
					{cta.href ? (
						<Link
							href={cta.href}
							target={cta.external ? "_blank" : undefined}
							rel={cta.external ? "noopener noreferrer" : undefined}
							className="btn group border-black text-black hover:bg-black hover:text-white"
						>
							{cta.label}
							<MoveRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
						</Link>
					) : null}
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
