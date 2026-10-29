import type { Metadata } from "next";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { PageHero } from "@/components/common/pageHero";
import { WishlistGrid } from "@/components/shop/wishlistGrid";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/wishlist/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, { title: page.title }, { robots: { index: false, follow: false } });
}

export default function Page() {
	return (
		<>
			<PageHero title={"Wishlist"} />
			<section className="container-site px-2.5 py-12.5 md:py-20">
				<WishlistGrid />
			</section>
		</>
	);
}
