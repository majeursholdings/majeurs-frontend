import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PageHero } from "@/components/common/pageHero";
import { ProductArchive, ProductArchiveSkeleton } from "@/components/shop/productArchive";
import { parseFilters } from "@/lib/shopFilters";
import { toSort } from "@/lib/shopSort";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

/** Rank Math head for the archive page (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/shop/page/[page]">): Promise<Metadata> {
	const p = await params;
	return seoMetadata(`/shop/page/${p.page}/`, { title: `Shop – page ${p.page}` });
}

/** URL params are read inside <Suspense> so the hero renders instantly (cacheComponents). */
export default function Page({ params, searchParams }: PageProps<"/shop/page/[page]">) {
	return (
		<>
			<PageHero title="Shop" />
			<Suspense fallback={<ProductArchiveSkeleton />}>
				<Content params={params} searchParams={searchParams} />
			</Suspense>
		</>
	);
}

async function Content({ params, searchParams }: Pick<PageProps<"/shop/page/[page]">, "params" | "searchParams">) {
	const [p, query] = await Promise.all([params, searchParams]);
	if (!/^\d+$/.test(p.page)) notFound();
	const page = Number(p.page);
	// WP canonical: /shop/page/1/ is /shop/
	if (page <= 1) redirect("/shop/");
	return (
		<>
			<SeoSchema path={`/shop/page/${page}/`} />
			<ProductArchive page={page} sort={toSort(query.orderby)} filters={parseFilters(query)} basePath="/shop/" />
		</>
	);
}
