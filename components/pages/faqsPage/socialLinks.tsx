import { BrandIcon } from "@/components/common/brandIcons";
import { getContact } from "@/lib/content/get";

/** "Social media": round black icons, from wp-admin > Site content > Contact details */
export async function SocialLinks() {
	const { socials } = await getContact();
	return (
		<ul className="flex flex-wrap gap-2">
			{socials.map((s) => (
				<li key={s.href}>
					<a
						href={s.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Majeurs on ${s.label}`}
						className="flex size-7 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gold"
					>
						{s.icon ? (
							<BrandIcon name={s.icon} className={s.icon === "x" ? "size-3" : "size-3.5"} />
						) : (
							<span className="text-[10px] font-bold uppercase">{s.label.slice(0, 2)}</span>
						)}
					</a>
				</li>
			))}
		</ul>
	);
}

export default SocialLinks;
