import type { Metadata } from "next";
import { Suspense } from "react";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { PageHero } from "@/components/common/pageHero";
import { ProductArchive, ProductArchiveSkeleton } from "@/components/shop/productArchive";
import { parseFilters } from "@/lib/shopFilters";
import { toSort } from "@/lib/shopSort";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/shop/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
	});
}

/** ?orderby= is read inside <Suspense> so the hero renders instantly (cacheComponents). */
export default function Page({ searchParams }: PageProps<"/shop">) {
	return (
		<>
			<SeoSchema path={page.path} />
			<PageHero title={"Shop"} />
			<Suspense fallback={<ProductArchiveSkeleton />}>
				<Content searchParams={searchParams} />
			</Suspense>
		</>
	);
}

async function Content({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
	const query = await searchParams;
	return <ProductArchive page={1} sort={toSort(query.orderby)} filters={parseFilters(query)} basePath="/shop/" />;
}
