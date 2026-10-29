import { BrandIcon } from "@/components/common/brandIcons";

/** Majeurs Holdings social accounts (from the live contact page) */
export const socialAccounts = [
	{ label: "Facebook", icon: "facebook", href: "https://www.facebook.com/majeursholdings/" },
	{ label: "Instagram", icon: "instagram", href: "https://www.instagram.com/majeursholdings/" },
	{ label: "LinkedIn", icon: "linkedin", href: "https://ng.linkedin.com/company/majeursholdings" },
	{ label: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/@themajeursholdings" },
	{ label: "X", icon: "x", href: "https://x.com/MajeursHoldings" },
	{ label: "YouTube", icon: "youtube", href: "https://www.youtube.com/@MAJEURSHOLDINGS" },
] as const;

/** "Social media": round black icons */
export function SocialLinks() {
	return (
		<ul className="flex flex-wrap gap-2">
			{socialAccounts.map((s) => (
				<li key={s.label}>
					<a
						href={s.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Majeurs on ${s.label}`}
						className="flex size-7 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gold"
					>
						<BrandIcon name={s.icon} className={s.icon === "x" ? "size-3" : "size-3.5"} />
					</a>
				</li>
			))}
		</ul>
	);
}

export default SocialLinks;
