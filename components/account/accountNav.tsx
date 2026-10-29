"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LogOut, MapPin, ShoppingBag, UserRound, type LucideIcon } from "lucide-react";
import { logoutAction } from "@/app/(commerce)/my-account/actions";
import { clearWishlist } from "@/components/providers/wishlistProvider";
import { cn } from "@/lib/utils";

/** WooCommerce my-account tabs; `match` also highlights sub-pages (an order under Orders) */
const links: { label: string; href: string; icon: LucideIcon; match?: string[] }[] = [
	{ label: "Dashboard", href: "/my-account/", icon: House },
	{ label: "Orders", href: "/my-account/orders/", icon: ShoppingBag, match: ["/my-account/orders/", "/my-account/view-order/"] },
	{ label: "Addresses", href: "/my-account/edit-address/", icon: MapPin, match: ["/my-account/edit-address/"] },
	{ label: "Account details", href: "/my-account/edit-account/", icon: UserRound },
];

const item =
	"flex w-full items-center gap-3 whitespace-nowrap border border-sand px-4 py-2.5 text-sm transition-colors duration-300 lg:border-0 lg:border-b lg:border-l-2 lg:border-l-transparent lg:py-3.5";

/** Tabs on the left (desktop) or a row of scrollable chips (mobile) */
export function AccountNav() {
	const pathname = usePathname();
	return (
		<nav aria-label="Account" className="-mx-2.5 overflow-x-auto px-2.5 lg:mx-0 lg:self-start lg:overflow-visible lg:px-0">
			<ul className="flex gap-2 lg:flex-col lg:gap-0">
				{links.map(({ label, href, icon: Icon, match }) => {
					const active = match ? match.some((m) => pathname.startsWith(m)) : pathname === href;
					return (
						<li key={href} className="shrink-0">
							<Link
								href={href}
								aria-current={active ? "page" : undefined}
								className={cn(item, active ? "bg-black text-white lg:border-l-gold lg:bg-sand-50 lg:text-black" : "text-charcoal hover:text-gold")}
							>
								<Icon className="size-4" strokeWidth={1.5} aria-hidden />
								{label}
							</Link>
						</li>
					);
				})}
				<li className="shrink-0">
					<form action={logoutAction} onSubmit={clearWishlist}>
						<button type="submit" className={cn(item, "text-charcoal hover:text-gold")}>
							<LogOut className="size-4" strokeWidth={1.5} aria-hidden />
							Log out
						</button>
					</form>
				</li>
			</ul>
		</nav>
	);
}

export default AccountNav;
