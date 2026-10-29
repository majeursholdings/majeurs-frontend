import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/common/pageHero";
import { ProductArchive, ProductArchiveSkeleton } from "@/components/shop/productArchive";
import { splitPagination, titleFromSlug } from "@/lib/routes/format";
import { productTagSlugs } from "@/lib/routes/wpRoutes";
import { getTags } from "@/lib/api/store";
import { parseFilters } from "@/lib/shopFilters";
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

/** URL params are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params, searchParams }: PageProps<"/product-tag/[...path]">) {
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
			<ProductArchive page={page} sort={toSort(query.orderby)} filters={parseFilters(query)} tag={tag.slug} basePath={`/product-tag/${path.join("/")}/`} />
		</>
	);
}
