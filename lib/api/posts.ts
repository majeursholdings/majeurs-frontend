import { cacheLife, cacheTag } from "next/cache";
import type { BlogCardProps } from "@/components/common/blogCard";
import { WP_API, decodeEntities } from "./wp";

export const POSTS_PER_PAGE = 9;

type WpTerm = { id: number; name: string; slug: string; taxonomy: string };

type WpPost = {
	id: number;
	slug: string;
	date: string;
	title: { rendered: string };
	excerpt?: { rendered: string };
	content?: { rendered: string };
	comment_status?: "open" | "closed";
	_embedded?: {
		"wp:featuredmedia"?: { source_url: string; alt_text?: string }[];
		"wp:term"?: WpTerm[][];
	};
};

export type PostCategory = { id: number; name: string; slug: string; count: number; description: string };

export type PostDetail = {
	id: number;
	slug: string;
	title: string;
	/** ISO date */
	date: string;
	/** WP block editor HTML (trusted: written by Majeurs staff in wp-admin) */
	content: string;
	excerpt: string;
	image?: { src: string; alt: string };
	categories: { name: string; slug: string }[];
	commentsOpen: boolean;
};

export type PostComment = { id: number; parent: number; author: string; date: string; content: string };

const plainText = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function categoriesOf(post: WpPost) {
	return (post._embedded?.["wp:term"] ?? [])
		.flat()
		.filter((t) => t.taxonomy === "category")
		.map((t) => ({ name: decodeEntities(t.name), slug: t.slug }));
}

function toCard(post: WpPost): BlogCardProps {
	return {
		title: decodeEntities(post.title.rendered),
		href: `/${post.slug}/`,
		image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
		categories: categoriesOf(post).map((c) => c.name),
	};
}

/** Latest blog posts as card props. Cached an hour, tagged "post-list". Posts live at /<slug>/ (WP permalinks). */
export async function getLatestPosts(count = 4): Promise<BlogCardProps[]> {
	return (await getPosts({ perPage: count })).posts;
}

export type PostQuery = { page?: number; perPage?: number; category?: number; search?: string };

/** A page of blog posts as card props, with WP's totals. Cached an hour, tagged "post-list". */
export async function getPosts({ page = 1, perPage = POSTS_PER_PAGE, category, search }: PostQuery = {}): Promise<{ posts: BlogCardProps[]; total: number; totalPages: number }> {
	"use cache";
	cacheLife("hours");
	cacheTag("post-list");

	const query = new URLSearchParams({
		per_page: String(perPage),
		page: String(page),
		_embed: "wp:featuredmedia,wp:term",
		_fields: "id,slug,title,_links,_embedded",
	});
	if (category) query.set("categories", String(category));
	if (search) query.set("search", search);

	const res = await fetch(`${WP_API}/posts?${query}`);
	// WP answers 400 for a page past the end
	if (res.status === 400) return { posts: [], total: 0, totalPages: 0 };
	if (!res.ok) throw new Error(`WP API ${res.status} for /posts?${query}`);
	const posts: WpPost[] = await res.json();

	return {
		posts: posts.map(toCard),
		total: Number(res.headers.get("x-wp-total") ?? posts.length),
		totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
	};
}

/** One post by slug, or null. Cached an hour, tagged "post:<slug>". */
export async function getPost(slug: string): Promise<PostDetail | null> {
	"use cache";
	cacheLife("hours");
	cacheTag(`post:${slug}`, "post-list");

	const query = new URLSearchParams({
		slug,
		_embed: "wp:featuredmedia,wp:term",
		_fields: "id,slug,date,title,excerpt,content,comment_status,_links,_embedded",
	});
	const res = await fetch(`${WP_API}/posts?${query}`);
	if (!res.ok) throw new Error(`WP API ${res.status} for /posts?slug=${slug}`);
	const [post]: WpPost[] = await res.json();
	if (!post) return null;

	const media = post._embedded?.["wp:featuredmedia"]?.[0];
	const title = decodeEntities(post.title.rendered);
	return {
		id: post.id,
		slug: post.slug,
		title,
		date: post.date,
		// majeurs.com blocks hotlinked uploads by Referer, so editor images load without one (preview hosts, cms.majeurs.com)
		content: (post.content?.rendered ?? "").replace(/<img /g, '<img referrerpolicy="no-referrer" loading="lazy" '),
		excerpt: plainText(post.excerpt?.rendered ?? ""),
		image: media ? { src: media.source_url, alt: decodeEntities(media.alt_text || title) } : undefined,
		categories: categoriesOf(post),
		commentsOpen: post.comment_status === "open",
	};
}

/** Blog categories that have posts. Cached an hour, tagged "post-categories". */
export async function getPostCategories(): Promise<PostCategory[]> {
	"use cache";
	cacheLife("hours");
	cacheTag("post-categories");

	const res = await fetch(`${WP_API}/categories?per_page=100&hide_empty=true&_fields=id,name,slug,count,description`);
	if (!res.ok) throw new Error(`WP API ${res.status} for /categories`);
	const items: PostCategory[] = await res.json();
	return items.map((c) => ({ ...c, name: decodeEntities(c.name), description: plainText(c.description) }));
}

/** Approved comments on a post, oldest first. Cached a few minutes, tagged "comments:<post id>". */
export async function getComments(postId: number): Promise<PostComment[]> {
	"use cache";
	cacheLife("minutes");
	cacheTag(`comments:${postId}`);

	const res = await fetch(`${WP_API}/comments?post=${postId}&per_page=100&order=asc&_fields=id,parent,author_name,date,content`);
	if (!res.ok) return [];
	const items: { id: number; parent: number; author_name: string; date: string; content: { rendered: string } }[] = await res.json();
	return items.map((c) => ({ id: c.id, parent: c.parent, author: decodeEntities(c.author_name), date: c.date, content: c.content.rendered }));
}
