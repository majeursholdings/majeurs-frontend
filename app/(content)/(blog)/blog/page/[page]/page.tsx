import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/blog/blogIndex";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

/** Rank Math head for the archive page (lib/seo.ts), with these values until its headless endpoint is on */
export async function generateMetadata({ params }: PageProps<"/blog/page/[page]">): Promise<Metadata> {
	const p = await params;
	return seoMetadata(`/blog/page/${p.page}/`, { title: `Blog – page ${p.page}`, alternates: { canonical: `/blog/page/${p.page}/` } });
}

/** URL params are read inside <Suspense> so the shell can render instantly (cacheComponents). */
export default function Page({ params }: PageProps<"/blog/page/[page]">) {
	return (
		<Suspense fallback={null}>
			<Content params={params} />
		</Suspense>
	);
}

async function Content({ params }: Pick<PageProps<"/blog/page/[page]">, "params">) {
	const p = await params;
	if (!/^\d+$/.test(p.page)) notFound();
	return (
		<>
			<SeoSchema path={`/blog/page/${p.page}/`} />
			<BlogIndex page={Number(p.page)} />
		</>
	);
}
