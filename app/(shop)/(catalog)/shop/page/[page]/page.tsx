import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { PageHero } from "@/components/common/pageHero";
import { ProductArchive, ProductArchiveSkeleton } from "@/components/shop/productArchive";
import { parseFilters, parseSearch } from "@/lib/shopFilters";
import { toSort } from "@/lib/shopSort";
import { SeoSchema } from "@/components/common/seoSchema";
import { getProducts } from "@/lib/api/store";
import { seoMetadata } from "@/lib/seo";

/** Rank Math head for the archive page (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/shop/page/[page]">): Promise<Metadata> {
	const p = await params;
	// /shop/page/1/ redirects to /shop/, which is its canonical
	const path = Number(p.page) > 1 ? `/shop/page/${p.page}/` : "/shop/";
	return seoMetadata(path, { title: `Shop – page ${p.page}`, alternates: { canonical: path } });
}

/** A sample page lets Page await params before <Suspense> (cacheComponents); other pages render on first request */
export function generateStaticParams() {
	return [{ page: "2" }];
}

/**
 * The page number is checked before <Suspense> so a bad one is a real 404 and page 1 a real redirect (mid-stream they
 * become 200 + noindex and a client-side redirect). Filters, sorting and the visitor's currency are still read inside it.
 */
export default async function Page({ params, searchParams }: PageProps<"/shop/page/[page]">) {
	const p = await params;
	if (!/^\d+$/.test(p.page)) notFound();
	const page = Number(p.page);
	// WP canonical: /shop/page/1/ is /shop/
	if (page <= 1) permanentRedirect("/shop/");
	if (!(await getProducts({ page })).products.length) notFound();
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
	const page = Number(p.page);
	return (
		<>
			<SeoSchema path={`/shop/page/${page}/`} />
			<ProductArchive page={page} sort={toSort(query.orderby)} filters={parseFilters(query)} search={parseSearch(query)} basePath="/shop/" />
		</>
	);
}
