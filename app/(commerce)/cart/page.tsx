import type { Metadata } from "next";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { CartView } from "@/components/shop/cartView";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/cart/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, { title: page.title }, { robots: { index: false, follow: false } });
}

export default function Page() {
	return (
		<div className="space-y-8 px-2.5">
			<h1 className="text-h2">{"Your Cart"}</h1>
			<CartView />
		</div>
	);
}
