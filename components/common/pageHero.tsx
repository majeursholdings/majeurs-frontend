import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { PrimaryLink } from "./btn";

export const DEFAULT_HERO_IMAGE = "https://majeurs.com/wp-content/uploads/contact-majeurs-furniture-brand-lagos-nigeria.webp";

type PageHeroProps = {
	title: string;
	eyebrow?: string;
	/** Optional line under the title */
	description?: string;
	image?: string;
	/** "banner" = 248px title strip (Shop, Blog, Contact …); "tall" = landing-page hero */
	size?: "banner" | "tall";
	className?: string;
	/** Overlay classes, e.g. "bg-black/30" (default "bg-black/50") */
	overlayClassName?: string;
	/** Vertical placement of the content block */
	position?: "top" | "center" | "bottom";
	priCta?: {
		slug: string;
		label: string;
	}
	/** Extra content under the title, e.g. a blog post's date and categories */
	children?: React.ReactNode;
};

/**
 * Title banner used across WP pages: full-width photo, 50% black overlay, centred
 * Nordique Pro title in sand (#E2DDDB). WP shop banner: 248px tall, title 48px.
 */
export function PageHero({ title, eyebrow, description, image = DEFAULT_HERO_IMAGE, size = "banner", className, overlayClassName, position = "center", priCta, children }: PageHeroProps) {
	return (
		<section
			className={cn(
				"relative isolate flex justify-center",
				{ top: "items-start", center: "items-center", bottom: "items-end" }[position],
				" overflow-hidden bg-ink px-2.5 text-center",
				size === "banner" ? "min-h-45 md:min-h-62" : "min-h-105 md:min-h-140 lg:min-h-[calc(100svh-var(--header-h-lg))]",
				className,
			)}
		>
			<Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />

			<div className={cn("absolute inset-0 -z-10 bg-black/50", overlayClassName)} aria-hidden />

			<div className={cn("max-w-162.5 space-y-3 py-10", size === "tall" && "lg:py-25")}>
				{eyebrow ? <p className="eyebrow text-sand">
					{eyebrow}
				</p> : null}

				<h1 className={cn("text-sand font-display", size === "banner" ? "text-h2 lg:text-[3rem]" : "text-display")}>
					{title}
				</h1>

				{description ? <p className="text-base text-sand font-bold">
					{description}
				</p> : null}

				{priCta ? <PrimaryLink slug={priCta.slug} label={priCta.label} /> : null}

				{children}
			</div>
		</section>
	);
}

export default PageHero;
