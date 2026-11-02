import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchForm } from "@/components/common/searchForm";
import { CUSTOMER_SERVICE_PHONE, whatsappLink } from "@/lib/contact";
import { shopCategories } from "@/lib/navigation";

export const metadata: Metadata = {
	title: "Page not found",
	robots: { index: false, follow: true },
};

/** Shown for unknown URLs and every notFound() call. The root layout supplies the header and footer. */
export default function NotFound() {
	return (
		<section className="container-site grid gap-12 px-2.5 md:px-5 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
			<div className="max-w-2xl">
				<p className="eyebrow text-gold-muted">Error 404</p>
				<h1 className="mt-4 text-balance">We couldn’t find that page</h1>
				<p className="mt-5 text-pretty text-charcoal">
					The link may be old, or the piece may have been renamed or retired. Search for it below, or start again from the shop.
				</p>

				<SearchForm placeholder="Search furniture, collections…" suggestions="products" className="mt-8 max-w-md" />

				<div className="mt-8 flex flex-wrap gap-3">
					<Link href="/shop/" className="btn bg-black text-white hover:bg-ink">
						Shop all furniture
					</Link>
					<Link href="/" className="btn border-black text-black hover:bg-black hover:text-white">
						Back to home
					</Link>
				</div>
			</div>

			<div className="grid content-start gap-10 border-t border-sand pt-10 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
				<nav aria-labelledby="not-found-categories">
					<h2 id="not-found-categories" className="eyebrow text-gold-muted">
						Browse by category
					</h2>
					<ul className="mt-4 divide-y divide-sand">
						{shopCategories.map((category) => (
							<li key={category.href}>
								<Link
									href={category.href}
									className="group flex items-center justify-between py-3 text-black transition-colors duration-150 hover:text-bronze"
								>
									{category.label}
									<ArrowRight className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<div>
					<h2 className="eyebrow text-gold-muted">Still looking?</h2>
					<p className="mt-4 text-sm text-charcoal">
						Tell us what you were after and we’ll find it, or make it.{" "}
						<a href={whatsappLink("Hi Majeurs, I followed a link that no longer works.")} target="_blank" rel="noopener noreferrer" className="text-bronze underline underline-offset-4 hover:text-gold">
							Chat on WhatsApp
						</a>{" "}
						or call{" "}
						<a href={CUSTOMER_SERVICE_PHONE.href} className="text-bronze underline underline-offset-4 whitespace-nowrap hover:text-gold">
							{CUSTOMER_SERVICE_PHONE.label}
						</a>
						.
					</p>
				</div>
			</div>
		</section>
	);
}
