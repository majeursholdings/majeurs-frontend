import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
	/** "dark" = black logo for light backgrounds, "light" = white logo for dark backgrounds/hero */
	variant?: "dark" | "light";
	/** Rendered width in px. The header uses 104px on mobile, ~130px on desktop; the SVG scales cleanly. */
	width?: number;
	href?: string | null;
	priority?: boolean;
	className?: string;
};

// Source artwork is 653 x 101
const RATIO = 101 / 653;

export function Logo({ variant = "dark", width = 130, href = "/", priority = false, className }: LogoProps) {
	const img = (
		<Image
			src={variant === "light" ? "/images/logo/majeurs-logo-white.svg" : "/images/logo/majeurs-logo-black.svg"}
			alt="Majeurs"
			width={width}
			height={Math.round(width * RATIO)}
			priority={priority}
			className={cn("h-auto", className)}
		/>
	);

	if (!href) return img;

	return (
		<Link href={href} aria-label="Majeurs home" className="inline-flex shrink-0">
			{img}
		</Link>
	);
}

export default Logo;
