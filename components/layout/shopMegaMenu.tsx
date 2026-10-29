"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, MoveRight } from "lucide-react";
import { shopCategories } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type MenuProduct = { name: string; category?: string; href: string; image?: string };

/**
 * Desktop "Shop" item and its dropdown. The panel spans the full screen (positioned against the sticky
 * <header>); its content lines up with the header's own edges (container-site + the header's gutters):
 * categories and "Shop all" on the leading side, then three featured pieces and a made-to-order card.
 */
export function ShopMegaMenu({ products }: { products: MenuProduct[] }) {
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		// -my-5 py-5: the hover area reaches the header's edges (its py-5), so moving down to the panel doesn't close it
		<div className="-my-5 flex items-center py-5" onMouseEnter={() => setOpen(true)} onMouseLeave={close} onKeyDown={(e) => e.key === "Escape" && close()}>
			<Link
				href="/shop/"
				className={cn("flex items-center text-sm font-bold text-black transition-colors duration-150 hover:text-gold", open && "text-gold")}
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
				className="ms-1 p-1 text-black"
			>
				<ChevronDown className={cn("size-3.5 transition-[rotate] duration-150", open && "rotate-180")} aria-hidden />
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						id="shop-mega-menu"
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
						className="absolute inset-x-0 top-full border-t border-sand bg-white shadow-[0_12px_24px_rgb(0_0_0/0.08)]"
						onBlur={(e) => {
							if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
						}}
					>
						<div className="container-site grid grid-cols-[minmax(10rem,13rem)_1fr] gap-x-12 px-2.5 py-10 lg:px-5">
							<nav aria-label="Shop by category" className="flex flex-col">
								<p className="eyebrow">Shop by category</p>
								<ul className="mt-4 space-y-1">
									{shopCategories.map((cat) => (
										<li key={cat.href}>
											<Link href={cat.href} onClick={close} className="block py-1.5 text-base text-black transition-colors duration-150 hover:text-gold">
												{cat.label}
											</Link>
										</li>
									))}
								</ul>
								<Link
									href="/shop/"
									onClick={close}
									className="group mt-8 inline-flex w-fit items-center gap-2 text-sm text-bronze transition-colors duration-150 hover:text-gold"
								>
									Shop all furniture
									<MoveRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
								</Link>
							</nav>

							<div>
								<p className="eyebrow">Featured pieces</p>
								<ul className="mt-4 grid grid-cols-4 gap-6">
									{products.map((p) => (
										<li key={p.href}>
											<Link href={p.href} onClick={close} className="group block">
												<div className="relative aspect-4/3 overflow-hidden bg-sand-50">
													{p.image ? (
														<Image
															src={p.image}
															alt=""
															fill
															sizes="(min-width: 1025px) 20vw, 0px"
															className="object-cover transition-[scale] duration-500 ease-out group-hover:scale-[1.03]"
														/>
													) : null}
												</div>
												{p.category ? <p className="mt-3 text-xs text-gold-muted">{p.category}</p> : null}
												<p className="mt-1 line-clamp-2 text-sm text-black transition-colors duration-150 group-hover:text-gold">{p.name}</p>
											</Link>
										</li>
									))}
									<li>
										<Link
											href="/custom-made-furniture-in-lagos/"
											onClick={close}
											className="group flex h-full flex-col justify-between gap-6 bg-sand p-6 transition-colors duration-150 hover:bg-cream"
										>
											<div className="space-y-2">
												<p className="eyebrow">Made to commission</p>
												<p className="text-lg text-black">Have a piece in mind?</p>
												<p className="text-sm text-charcoal">Choose the size, material and finish. Every piece is handcrafted to order.</p>
											</div>
											<span className="inline-flex items-center gap-2 text-sm text-bronze">
												Custom-made furniture
												<MoveRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
											</span>
										</Link>
									</li>
								</ul>
							</div>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
