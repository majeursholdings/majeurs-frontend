"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBasket, UserRound, X } from "lucide-react";
import { useCart } from "@/components/providers/cartProvider";
import { MiniCart } from "@/components/shop/miniCart";
import { CurrencySwitcher } from "./currencySwitcher";
import { SEARCH_TOGGLE_ATTR } from "./searchToggle";

// The two overlays carry the motion library (~45 KB gzipped, and the search form's kit behind that). They're
// fetched when a visitor first opens one, preloaded as the pointer reaches its button, so a page that is only
// read never downloads them. Keep motion/react out of everything else the root layout renders.
const loadSearchPanel = () => import("./searchPanel");
const loadMobileMenu = () => import("./mobileMenu");
const SearchPanel = dynamic(() => loadSearchPanel().then((mod) => mod.SearchPanel), { ssr: false });
const MobileMenu = dynamic(() => loadMobileMenu().then((mod) => mod.MobileMenu), { ssr: false });

type HeaderActionsProps = { currency: string; available: string[] };

type Panel = "search" | "menu" | null;

const iconButton = "inline-flex size-8 items-center justify-center text-black transition-colors hover:text-gold";

/** Right-hand header icons. Owns which overlay (search or mobile menu) is open so only one shows at a time; the basket opens the mini-cart. */
export function HeaderActions({ currency, available }: HeaderActionsProps) {
	const { count: cartCount, setDrawerOpen } = useCart();
	const [panel, setPanel] = useState<Panel>(null);
	// the overlays mount on the first open and stay mounted, so their close animations still play
	const [overlaysMounted, setOverlaysMounted] = useState(false);

	const toggle = (next: Exclude<Panel, null>) => {
		const value = panel === next ? null : next;
		setOverlaysMounted(true);
		setPanel(value);
		// lock page scroll while the full-screen mobile menu is open (event-driven, no effect needed)
		document.body.style.overflow = value === "menu" ? "hidden" : "";
	};

	const close = () => {
		setPanel(null);
		document.body.style.overflow = "";
	};

	return (
		<div className="flex items-center justify-end gap-1 md:gap-2">
			<Link 
				href="/my-account/" 
				title="My account" 
				aria-label="My account" 
				className={iconButton}
			>
				<UserRound className="size-4.5" strokeWidth={1.5} aria-hidden />
			</Link>

			<button
				type="button"
				{...{ [SEARCH_TOGGLE_ATTR]: "" }}
				aria-label={panel === "search" ? "Close search" : "Search products"}
				aria-expanded={panel === "search"}
				onPointerEnter={() => void loadSearchPanel()}
				onFocus={() => void loadSearchPanel()}
				onClick={() => toggle("search")}
				className={iconButton}
			>
				<Search className="size-4.5" strokeWidth={1.5} aria-hidden />
			</button>

			<button
				type="button"
				aria-label={`Cart, ${cartCount} items`}
				aria-haspopup="dialog"
				onClick={() => {
					close();
					setDrawerOpen(true);
				}}
				className={`${iconButton} relative`}
			>
				<ShoppingBasket className="size-4.75" strokeWidth={1.5} aria-hidden />
				{cartCount > 0 ? (
					<span className="absolute right-0 top-0.5 flex size-4 items-center justify-center rounded-full bg-[#c0392b] text-[10px] leading-none text-white">
						{cartCount}
					</span>
				) : null}
			</button>

			<CurrencySwitcher currency={currency} available={available} />

			<button
				type="button"
				aria-label={panel === "menu" ? "Close menu" : "Open menu"}
				aria-expanded={panel === "menu"}
				aria-controls="mobile-menu"
				onPointerEnter={() => void loadMobileMenu()}
				onFocus={() => void loadMobileMenu()}
				onClick={() => toggle("menu")}
				className={`${iconButton} lg:hidden`}
			>
				{panel === "menu" ? (
					<X className="size-6" strokeWidth={1.5} aria-hidden />
				) : (
					<Menu className="size-6" strokeWidth={1.75} aria-hidden />
				)}
			</button>

			{overlaysMounted ? (
				<>
					<SearchPanel open={panel === "search"} onClose={close} />
					<MobileMenu open={panel === "menu"} onClose={close} />
				</>
			) : null}
			<MiniCart />
		</div>
	);
}
