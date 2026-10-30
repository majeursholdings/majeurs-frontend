import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/pageHero";
import { ProductArchive, ProductArchiveSkeleton } from "@/components/shop/productArchive";
import { splitPagination, titleFromSlug } from "@/lib/routes/format";
import { productCategoryPaths } from "@/lib/routes/wpRoutes";
import { getCategories, getProducts } from "@/lib/api/store";
import { parseFilters, parseSearch } from "@/lib/shopFilters";
import { toSort } from "@/lib/shopSort";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

/** Also receives pagination: /product-category/sofas/page/2/ -> ["sofas","page","2"] */
export function generateStaticParams() {
	return productCategoryPaths.map((path) => ({ path: path.split("/") }));
}

/** Rank Math head for the archive page (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/product-category/[...path]">): Promise<Metadata> {
	const p = await params;
	const { path, page } = splitPagination(p.path);
	const slug = path.at(-1) ?? "";
	const category = (await getCategories()).find((c) => c.slug === slug);
	return seoMetadata(archivePath(path, page), { title: category?.name ?? titleFromSlug(slug) });
}

const archivePath = (path: string[], page: number) => `/product-category/${path.join("/")}/${page > 1 ? `page/${page}/` : ""}`;

/**
 * The category and page are checked before <Suspense> so an unknown one is a real 404 (notFound() mid-stream sends
 * 200 + noindex). Filters, sorting and the visitor's currency are still read inside it.
 */
export default async function Page({ params, searchParams }: PageProps<"/product-category/[...path]">) {
	const [p, categories] = await Promise.all([params, getCategories()]);
	const { path, page } = splitPagination(p.path);
	const category = categories.find((c) => c.slug === path.at(-1));
	if (!category || (page > 1 && !(await getProducts({ page, category: category.slug })).products.length)) notFound();
	return (
		<Suspense fallback={<ProductArchiveSkeleton />}>
			<Content params={params} searchParams={searchParams} />
		</Suspense>
	);
}

async function Content({ params, searchParams }: Pick<PageProps<"/product-category/[...path]">, "params" | "searchParams">) {
	const [p, query, categories] = await Promise.all([params, searchParams, getCategories()]);
	const { path, page } = splitPagination(p.path);
	const category = categories.find((c) => c.slug === path.at(-1));
	if (!category) notFound();

	return (
		<>
			<SeoSchema path={archivePath(path, page)} />
			<PageHero title={category.name} />
			<ProductArchive page={page} sort={toSort(query.orderby)} filters={parseFilters(query)} search={parseSearch(query)} category={category.slug} basePath={`/product-category/${path.join("/")}/`} />
		</>
	);
}
