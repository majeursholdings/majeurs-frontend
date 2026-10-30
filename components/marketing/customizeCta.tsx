import Image from "next/image";
import Link from "next/link";
import { getSiteContent } from "@/lib/content/get";
import { customizeCtaContent } from "@/lib/content/site";
import { cn } from "@/lib/utils";

type CustomizeCtaProps = {
	/** overrides the band's own image (wp-admin > Site content) */
	image?: string;
	/** Edge to edge with no outer padding (blog pages), instead of a 1300px box */
	fullBleed?: boolean;
	className?: string;
};

/** "Customize your furniture style" band shown above the newsletter on WP shop/archive pages and under the blog. */
export async function CustomizeCta({ image, fullBleed = false, className }: CustomizeCtaProps) {
	const c = await getSiteContent(customizeCtaContent);
	return (
		<section className={cn(!fullBleed && "px-2.5 py-12.5 md:px-5", className)}>
			<div
				className={cn(
					"relative isolate mx-auto flex items-center justify-center overflow-hidden px-6 py-14 text-center",
					fullBleed ? "min-h-[300px] md:min-h-[420px]" : "min-h-[260px] max-w-site md:min-h-[360px]",
				)}
			>
				<Image src={image || c.image} alt="" fill sizes="(min-width: 1300px) 1300px, 100vw" className="-z-20 object-cover" />
				<div className="absolute inset-0 -z-10 bg-black/55" aria-hidden />
				<div className="max-w-2xl space-y-4">
					<p className="text-xs uppercase tracking-eyebrow text-white">{c.eyebrow}</p>
					<p className="font-display text-2xl text-white md:text-[1.75rem]">{c.title}</p>
					{c.cta.href ? (
						<Link href={c.cta.href} target={c.cta.external ? "_blank" : undefined} className="btn mt-2 bg-black text-white hover:bg-white hover:text-black">
							{c.cta.label}
						</Link>
					) : null}
				</div>
			</div>
		</section>
	);
}

export default CustomizeCta;
