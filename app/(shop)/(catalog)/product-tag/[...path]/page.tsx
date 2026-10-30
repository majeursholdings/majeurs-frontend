import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/pageHero";
import { ProductArchive, ProductArchiveSkeleton } from "@/components/shop/productArchive";
import { splitPagination, titleFromSlug } from "@/lib/routes/format";
import { productTagSlugs } from "@/lib/routes/wpRoutes";
import { getProducts, getTags } from "@/lib/api/store";
import { parseFilters, parseSearch } from "@/lib/shopFilters";
import { toSort } from "@/lib/shopSort";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

/** Also receives pagination: /product-tag/<slug>/page/2/ */
export function generateStaticParams() {
	return productTagSlugs.map((slug) => ({ path: [slug] }));
}

/** Rank Math head for the archive page (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/product-tag/[...path]">): Promise<Metadata> {
	const p = await params;
	const { path, page } = splitPagination(p.path);
	const slug = path.at(-1) ?? "";
	const tag = (await getTags()).find((t) => t.slug === slug);
	return seoMetadata(archivePath(path, page), { title: tag?.name ?? titleFromSlug(slug) });
}

const archivePath = (path: string[], page: number) => `/product-tag/${path.join("/")}/${page > 1 ? `page/${page}/` : ""}`;

/**
 * The tag and page are checked before <Suspense> so an unknown one is a real 404 (notFound() mid-stream sends
 * 200 + noindex). Filters, sorting and the visitor's currency are still read inside it.
 */
export default async function Page({ params, searchParams }: PageProps<"/product-tag/[...path]">) {
	const [p, tags] = await Promise.all([params, getTags()]);
	const { path, page } = splitPagination(p.path);
	const tag = tags.find((t) => t.slug === path.at(-1));
	if (!tag || (page > 1 && !(await getProducts({ page, tag: tag.slug })).products.length)) notFound();
	return (
		<Suspense fallback={<ProductArchiveSkeleton />}>
			<Content params={params} searchParams={searchParams} />
		</Suspense>
	);
}

async function Content({ params, searchParams }: Pick<PageProps<"/product-tag/[...path]">, "params" | "searchParams">) {
	const [p, query, tags] = await Promise.all([params, searchParams, getTags()]);
	const { path, page } = splitPagination(p.path);
	const tag = tags.find((t) => t.slug === path.at(-1));
	if (!tag) notFound();

	return (
		<>
			<SeoSchema path={archivePath(path, page)} />
			<PageHero title={tag.name} />
			<ProductArchive page={page} sort={toSort(query.orderby)} filters={parseFilters(query)} search={parseSearch(query)} tag={tag.slug} basePath={`/product-tag/${path.join("/")}/`} />
		</>
	);
}
