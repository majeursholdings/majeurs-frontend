"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { currencies } from "@/lib/currency";
import { cn } from "@/lib/utils";

/**
 * Same behaviour as the WP switcher: links to ?currency=XXX. proxy.ts sets the rtsb_currency cookie
 * and redirects back to the clean URL, so prices re-render server-side in the new currency.
 */
export function CurrencySwitcher({ currency, available }: { currency: string; available: string[] }) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	// only currencies WP has a rate for (lib/api/currency.ts), so prices are never mislabelled
	const options = currencies.filter((c) => available.includes(c.code));
	const current = options.find((c) => c.code === currency) ?? currencies.find((c) => c.code === currency) ?? currencies[0];

	return (
		<div
			className="relative"
			onMouseLeave={() => setOpen(false)}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
			}}
		>
			<button
				type="button"
				aria-label={`Currency: ${current.code}. Change currency`}
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
				className="inline-flex h-9 items-center gap-1.5 px-1 text-sm text-black hover:text-gold"
			>
				<span aria-hidden className="text-base leading-none">
					{current.flag}
				</span>
				<span className="hidden md:inline">{current.code}</span>
				<ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
			</button>

			<AnimatePresence>
				{open ? (
					<motion.ul
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.15 }}
						className="absolute right-0 top-full z-50 min-w-27.5 border border-sand bg-white py-1 shadow-[0_8px_20px_rgb(0_0_0/0.08)]"
					>
						{options.map((c) => (
							<li key={c.code}>
								<a
									href={`${pathname}?currency=${c.code}`}
									onClick={(e) => {
										// keep the rest of the query (e.g. ?q= on search); proxy.ts strips ?currency= after setting the cookie
										e.preventDefault();
										const params = new URLSearchParams(window.location.search);
										params.set("currency", c.code);
										// full reload on purpose: the cart (CartProvider) and every price must refetch in the new currency
										// eslint-disable-next-line @next/next/no-location-assign-relative-destination
										window.location.assign(`${pathname}?${params}`);
									}}
									aria-current={c.code === current.code ? "true" : undefined}
									className={cn(
										"flex items-center gap-2 px-3 py-2 text-sm hover:bg-sand-50",
										c.code === current.code && "text-gold",
									)}
								>
									<span aria-hidden>{c.flag}</span>
									{c.label}
								</a>
							</li>
						))}
					</motion.ul>
				) : null}
			</AnimatePresence>
		</div>
	);
}
