"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { shopCategories } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Desktop "Shop" item with the full-width dropdown: category list + three product cards (as on WP). */
export type MenuProduct = { name: string; category?: string; href: string; image?: string };

export function ShopMegaMenu({ products }: { products: MenuProduct[] }) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className="flex items-center"
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
		>
			<Link
				href="/shop/"
				className={cn("flex items-center font-bold text-sm text-black transition-colors hover:text-gold", open && "text-gold")}
				onFocus={() => setOpen(true)}
			>
				Shop
			</Link>
			<button
				type="button"
				aria-label="Show shop categories"
				aria-expanded={open}
				aria-controls="shop-mega-menu"
				onClick={() => setOpen((v) => !v)}
				className="ml-1 p-1 text-black"
			>
				<ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						id="shop-mega-menu"
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
						className="absolute inset-x-0 top-full border-t border-sand bg-white shadow-[0_12px_24px_rgb(0_0_0/0.08)]"
						onBlur={(e) => {
							if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
						}}
					>
						<div className="grid grid-cols-[200px_1fr] gap-10 px-8 py-7">
							<ul className="space-y-3 pl-8 pt-1">
								{shopCategories.map((cat) => (
									<li key={cat.href}>
										<Link
											href={cat.href}
											onClick={() => setOpen(false)}
											className="text-sm font-bold text-black transition-colors hover:text-gold"
										>
											{cat.label}
										</Link>
									</li>
								))}
							</ul>

							<ul className="grid grid-cols-3 gap-6">
								{products.map((p) => (
									<li key={p.href}>
										<Link href={p.href} onClick={() => setOpen(false)} className="group block">
											<div className="relative aspect-square overflow-hidden bg-sand-50">
												{p.image ? <Image
													src={p.image}
													alt={p.name}
													fill
													sizes="(min-width: 1025px) 25vw, 0px"
													className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
												/> : null}
											</div>
											<p className="mt-4 text-xs text-gold-muted">{p.category}</p>
											<p className="mt-1 text-base text-black">{p.name}</p>
										</Link>
									</li>
								))}
							</ul>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
