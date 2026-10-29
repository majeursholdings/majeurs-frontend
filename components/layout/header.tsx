import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/common/logo";
import { mainNav, topBarLinks } from "@/lib/navigation";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { getCurrencyRates, getFx } from "@/lib/api/currency";
import { ShopMegaMenu } from "./shopMegaMenu";
import { getProducts } from "@/lib/api/store";
import { HeaderActions } from "./headerActions";

/**
 * Site header, matching the WP header (Elementor template 6795):
 * - Desktop (≥1025px): beige top bar (About, Catalogue, Furniture Care, Trade Program), then a sticky
 *   white bar with the logo, centred nav (Shop mega menu, Custom-Made Furniture, Our Collections)
 *   and the account, search, cart and currency icons.
 * - Tablet/mobile (≤1024px): logo, icons and a hamburger that opens the full-screen menu.
 *
 * Returns a fragment so the sticky bar sticks to the page, not to the header box.
 */
export async function Header() {
	// WP mega menu shows the first three products in the default shop order
	const { products } = await getProducts({ perPage: 3 }).catch(() => ({ products: [] }));
	const menuProducts = products.map((p) => ({ name: p.name, category: p.category, href: `/product/${p.slug}/`, image: p.images[0]?.src }));

	return (
		<>
			<div className="hidden bg-sand-50 lg:block">
				<nav aria-label="Company" className="container-site flex h-10.75 items-center justify-end gap-8">
					{topBarLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-xs uppercase font-bold tracking-button text-brown transition-colors hover:text-gold"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>

			<header className="sticky top-0 z-40 border-b border-sand bg-white">
				<div className="container-site relative py-5 px-2.5 lg:px-5 flex flex-nowrap items-center justify-between gap-2.5 lg:gap-5">
					<Logo priority className="aspect-653/101 max-w-26 lg:max-w-37.75 w-full" />

					<nav aria-label="Main" className="hidden h-full items-stretch justify-center gap-8 lg:flex">
						<ShopMegaMenu products={menuProducts} />
						{mainNav.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="flex items-center text-sm font-bold text-black transition-colors hover:text-gold"
							>
								{link.label}
							</Link>
						))}
					</nav>

					<Suspense fallback={<HeaderActions currency={DEFAULT_CURRENCY} available={[DEFAULT_CURRENCY]} />}>
						<HeaderActionsWithCookies />
					</Suspense>
				</div>
			</header>
		</>
	);
}

/** Reads the currency cookie, so it renders inside <Suspense> (cacheComponents). The cart count is client-side (CartProvider). */
async function HeaderActionsWithCookies() {
	const [fx, rates] = await Promise.all([getFx(), getCurrencyRates()]);
	return <HeaderActions currency={fx.code} available={rates.currencies.map((c) => c.code)} />;
}

export default Header;
