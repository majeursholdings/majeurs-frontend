import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { BrandIcon, type BrandIconName } from "@/components/common/brandIcons";
import { SearchForm } from "@/components/common/searchForm";
import { getLatestPosts, getPostCategories } from "@/lib/api/posts";

type BlogSidebarProps = {
	/** On a post, "Share post" takes the place of the category list (as on WP) */
	share?: { title: string; url: string };
};

const heading = "mb-4 text-xs uppercase tracking-button text-black";

/**
 * Left-hand sidebar on WP blog pages: search, featured posts (the 3 newest), categories or share links,
 * and the Atunlo banner. Data is cached ("post-list" / "post-categories"), so it prerenders.
 */
export async function BlogSidebar({ share }: BlogSidebarProps) {
	const [featured, categories] = await Promise.all([getLatestPosts(3), share ? [] : getPostCategories()]);

	return (
		<div className="space-y-8 lg:sticky lg:top-28">
			<SearchForm placeholder="Search blog" params={{ type: "post" }} />

			<section>
				<h2 className={heading}>Featured posts</h2>
				<ul className="space-y-4">
					{featured.map((post) => (
						<li key={post.href}>
							<Link href={post.href} className="group flex items-center gap-3">
								<span className="relative aspect-4/3 w-20 shrink-0 overflow-hidden bg-sand-50">
									{post.image ? <Image src={post.image} alt="" fill sizes="80px" className="object-cover" /> : null}
								</span>
								<span className="line-clamp-2 text-xs text-ink transition-colors group-hover:text-gold">{post.title}</span>
							</Link>
						</li>
					))}
				</ul>
			</section>

			<section className="border-t border-sand pt-8">
				{share ? (
					<>
						<h2 className={heading}>Share post</h2>
						<ShareLinks {...share} />
					</>
				) : (
					<>
						<h2 className={heading}>Category</h2>
						<ul className="space-y-2.5">
							{categories
								.filter((c) => c.slug !== "uncategorized")
								.map((c) => (
									<li key={c.slug}>
										<Link href={`/category/${c.slug}/`} className="pl-1 text-xs text-charcoal transition-colors hover:text-gold">
											{c.name}
										</Link>
									</li>
								))}
						</ul>
					</>
				)}
			</section>

			<a href="https://atunlo.majeurs.com/?referral=majeurs-blog" target="_blank" rel="noopener noreferrer" className="block border-t border-sand pt-8">
				<Image
					src="https://majeurs.com/wp-content/uploads/Newly-Launched-Atunlo-Collection.webp"
					alt="Newly launched: the Atunlo Collection"
					width={500}
					height={600}
					sizes="(min-width: 1025px) 260px, 100vw"
					className="h-auto w-full"
				/>
			</a>
		</div>
	);
}

function ShareLinks({ title, url }: { title: string; url: string }) {
	const u = encodeURIComponent(url);
	const t = encodeURIComponent(title);
	const links: { label: string; href: string; icon: BrandIconName | "mail" }[] = [
		{ label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: "facebook" },
		{ label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: "x" },
		{ label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: "linkedin" },
		{ label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, icon: "whatsapp" },
		{ label: "Email", href: `mailto:?subject=${t}&body=${u}`, icon: "mail" },
	];
	return (
		<ul className="flex gap-2">
			{links.map((l) => (
				<li key={l.label}>
					<a
						href={l.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Share on ${l.label}`}
						className="flex size-7 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gold"
					>
						{l.icon === "mail" ? <Mail className="size-3.5" aria-hidden /> : <BrandIcon name={l.icon} className="size-3.5" />}
					</a>
				</li>
			))}
		</ul>
	);
}

export default BlogSidebar;
