import Image from "next/image";
import { cn } from "@/lib/utils";

type SplitFeatureProps = {
	image: string;
	imageAlt?: string;
	/** Image on the left (default) or right on desktop */
	imageSide?: "left" | "right";
	eyebrow?: string;
	title: string;
	/** Heading level; h2 by default */
	as?: "h2" | "h3";
	children?: React.ReactNode;
	/** Buttons under the text */
	actions?: React.ReactNode;
	/** Replaces the image, e.g. a YouTube embed */
	media?: React.ReactNode;
	className?: string;
};

/** WP two-column block: image (or video) on one side, eyebrow + heading + text + buttons on the other */
export function SplitFeature({ image, imageAlt = "", imageSide = "left", eyebrow, title, as: Heading = "h2", children, actions, media, className }: SplitFeatureProps) {
	return (
		<section className={cn("px-2.5 py-12.5 md:px-5 md:py-20", className)}>
			<div className="container-site grid items-center gap-8 md:grid-cols-2 md:gap-12">
				<div className={cn("relative aspect-[4/3] overflow-hidden bg-sand-50", imageSide === "right" && "md:order-2")}>
					{media ?? <Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />}
				</div>
				<div className="space-y-4">
					{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
					<Heading className="text-h3 font-display">{title}</Heading>
					{children ? <div className="space-y-3 text-sm text-charcoal">{children}</div> : null}
					{actions ? <div className="flex flex-wrap gap-3 pt-2">{actions}</div> : null}
				</div>
			</div>
		</section>
	);
}

/** Centred eyebrow + heading + intro used above grids and forms */
export function SectionIntro({ eyebrow, title, children, className }: { eyebrow?: string; title: string; children?: React.ReactNode; className?: string }) {
	return (
		<div className={cn("mx-auto max-w-2xl space-y-3 text-center", className)}>
			{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
			<h2 className="text-h3 font-display">{title}</h2>
			{children ? <div className="text-sm text-charcoal">{children}</div> : null}
		</div>
	);
}
