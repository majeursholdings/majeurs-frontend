import Image from "next/image";
import Link from "next/link";
import { MoveRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export type BlogCardProps = {
	title: string;
	href: string;
	image?: string;
	categories?: string[];
	className?: string;
};

/** WP blog grid card: 4:3 image (slow zoom on hover), category line, title, "Read blog" link. */
export function BlogCard({ title, href, image, categories = [], className }: BlogCardProps) {
	return (
		<article className={cn("group/blog flex flex-col", className)}>
			<Link href={href} aria-label={title} className="relative block aspect-4/3 overflow-hidden bg-sand-50">
				{image ? <Image
					src={image}
					alt=""
					fill
					sizes="(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw"
					className="object-cover transition-[scale] duration-700 ease-in-out group-hover/blog:scale-[1.03]"
				/> : null}
			</Link>

			{categories.length ? (
				<p className="mt-5 flex items-center gap-1.5 text-xs text-ink">
					<Tag className="size-3.5 shrink-0" aria-hidden />
					{categories.join(" · ")}
				</p>
			) : null}

			<h3 className="mt-2 line-clamp-2 text-base text-ink">
				<Link href={href} className="font-medium transition-colors duration-500 ease-in-out hover:text-gold">
					{title}
				</Link>
			</h3>

			<Link
				href={href}
				tabIndex={-1}
				className="group/read mt-4 inline-flex w-fit items-center gap-2 text-xs uppercase text-bronze transition-colors duration-500 ease-in-out hover:text-gold"
			>
				Read blog
				<MoveRight className="size-4 transition-transform duration-500 ease-in-out group-hover/read:translate-x-1" />
			</Link>
		</article>
	);
}

export default BlogCard;
