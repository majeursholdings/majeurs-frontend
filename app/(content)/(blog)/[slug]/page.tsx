import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { BlogSidebar } from "@/components/blog/blogSidebar";
import { PostComments } from "@/components/blog/postComments";
import { PageHero } from "@/components/common/pageHero";
import { getComments, getPost, type PostDetail } from "@/lib/api/posts";
import { SITE_URL } from "@/lib/contact";
import { titleFromSlug } from "@/lib/routes/format";
import { blogPostSlugs } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

/**
 * Blog posts live at the site root (/<post-slug>/). Static page folders take precedence,
 * so only unmatched root slugs reach here.
 * TODO: fetch slugs from /wp-json/wp/v2/posts instead of the snapshot.
 */
export function generateStaticParams() {
	return blogPostSlugs.map((slug) => ({ slug }));
}

/** Rank Math head for the post (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
	const p = await params;
	const post = await getPost(p.slug);
	if (!post) return { title: titleFromSlug(p.slug) };
	return seoMetadata(`/${post.slug}/`, {
		title: post.title,
		description: post.excerpt.slice(0, 160),
		alternates: { canonical: `/${post.slug}/` },
		openGraph: {
			type: "article",
			title: post.title,
			description: post.excerpt.slice(0, 200),
			url: `/${post.slug}/`,
			publishedTime: post.date,
			images: post.image ? [{ url: post.image.src, alt: post.image.alt }] : undefined,
		},
	});
}

/** URL params are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params }: PageProps<"/[slug]">) {
	return (
		<Suspense fallback={<PostSkeleton />}>
			<Content params={params} />
		</Suspense>
	);
}

async function Content({ params }: Pick<PageProps<"/[slug]">, "params">) {
	const p = await params;
	const post = await getPost(p.slug);
	if (!post) notFound();
	const url = `${SITE_URL}/${post.slug}/`;

	return (
		<>
			<SeoSchema path={`/${post.slug}/`} fallback={postSchema(post, url)} />

			<PageHero className="col-full min-h-60 md:min-h-82" title={post.title} image={post.image?.src} overlayClassName="bg-black/60">
				<PostMeta post={post} />
			</PageHero>

			{/* WP block editor content, written by Majeurs staff in wp-admin */}
			<article
				className="col-main prose-majeurs min-w-0 text-sm text-charcoal md:text-[0.9375rem] [&_figure]:my-8 [&_h2]:font-display [&_h2]:text-h4 [&_h2]:text-black [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-black [&_img]:h-auto [&_img]:w-full"
				dangerouslySetInnerHTML={{ __html: post.content }}
			/>

			<aside aria-label="Blog" className="col-aside">
				<BlogSidebar share={{ title: post.title, url }} />
			</aside>

			<Suspense fallback={null}>
				<PostComments postId={post.id} open={post.commentsOpen} />
			</Suspense>
		</>
	);
}

/** ■ May 22, 2026  ■ No Comments  ■ Design, Product */
async function PostMeta({ post }: { post: PostDetail }) {
	const count = (await getComments(post.id)).length;
	const dot = "before:mr-2 before:inline-block before:size-1.5 before:bg-sand before:align-middle";
	return (
		<p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-sand">
			<time dateTime={post.date} className={dot}>
				{dayjs(post.date).format("MMMM D, YYYY")}
			</time>
			<a href="#comments" className={`${dot} hover:text-white`}>
				{count ? `${count} Comment${count === 1 ? "" : "s"}` : "No Comments"}
			</a>
			{post.categories.length ? (
				<span className={dot}>
					{post.categories.map((c, i) => (
						<span key={c.slug}>
							{i ? ", " : ""}
							<Link href={`/category/${c.slug}/`} className="hover:text-white">
								{c.name}
							</Link>
						</span>
					))}
				</span>
			) : null}
		</p>
	);
}

function postSchema(post: PostDetail, url: string) {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.excerpt.slice(0, 200) || undefined,
		image: post.image ? [post.image.src] : undefined,
		datePublished: post.date,
		mainEntityOfPage: url,
		articleSection: post.categories.map((c) => c.name),
		publisher: { "@type": "Organization", name: "Majeurs", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
	};
}

function PostSkeleton() {
	return (
		<>
			<div className="col-full min-h-60 animate-pulse bg-ink md:min-h-82" />
			<div className="col-main space-y-4" aria-label="Loading post">
				{Array.from({ length: 8 }, (_, i) => (
					<div key={i} className="h-4 animate-pulse bg-sand-50" style={{ width: `${90 - (i % 3) * 15}%` }} />
				))}
			</div>
		</>
	);
}
