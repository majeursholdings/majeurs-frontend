"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { mainNav, shopCategories, topBarLinks } from "@/lib/navigation";

type MobileMenuProps = { open: boolean; onClose: () => void };

/**
 * Full-screen menu for ≤1024px, matching the WP fix of 24 Sep (Custom Code 7118):
 * stacked items with dividers, Shop expands its categories inline, and a beige
 * "More from Majeurs" block with the top-bar links as a 2×2 grid of tiles.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
	const [shopOpen, setShopOpen] = useState(false);
	const item = "flex w-full items-center justify-between border-b border-sand py-4 text-base text-black";

	return (
		<AnimatePresence>
			{open ? (
				<motion.nav
					id="mobile-menu"
					aria-label="Mobile"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="fixed inset-x-0 bottom-0 top-17.5 z-40 overflow-y-auto bg-white lg:hidden"
				>
					<div className="container-site pb-10 pt-2">
						<div>
							<button
								type="button"
								className={item}
								aria-expanded={shopOpen}
								onClick={() => setShopOpen((v) => !v)}
							>
								Shop
								{shopOpen ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
							</button>
							<AnimatePresence initial={false}>
								{shopOpen ? (
									<motion.ul
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="overflow-hidden"
									>
										<li>
											<Link href="/shop/" onClick={onClose} className="block py-2.5 pl-4 text-sm text-charcoal">
												All products
											</Link>
										</li>
										{shopCategories.map((cat) => (
											<li key={cat.href}>
												<Link href={cat.href} onClick={onClose} className="block py-2.5 pl-4 text-sm text-charcoal">
													{cat.label}
												</Link>
											</li>
										))}
									</motion.ul>
								) : null}
							</AnimatePresence>
						</div>

						{mainNav.map((link) => (
							<Link key={link.href} href={link.href} onClick={onClose} className={item}>
								{link.label}
							</Link>
						))}

						<div className="mt-8 bg-sand-50 p-4">
							<p className="eyebrow mb-3 text-charcoal">More from Majeurs</p>
							<ul className="grid grid-cols-2 gap-2">
								{topBarLinks.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											onClick={onClose}
											className="flex h-full items-center justify-between gap-2 bg-white px-3 py-3 text-xs uppercase tracking-button text-brown transition-colors active:bg-brown active:text-white"
										>
											{link.label}
											<ArrowRight className="size-3.5 shrink-0" aria-hidden />
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</motion.nav>
			) : null}
		</AnimatePresence>
	);
}
