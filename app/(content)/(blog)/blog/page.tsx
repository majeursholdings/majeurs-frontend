import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/blogIndex";
import { getStaticPage } from "@/lib/routes/wpRoutes";
import { SeoSchema } from "@/components/common/seoSchema";
import { seoMetadata } from "@/lib/seo";

const page = getStaticPage("/blog/");

/** Rank Math head for this URL (lib/seo.ts); these values stand in until its headless endpoint is on. */
export function generateMetadata(): Promise<Metadata> {
	return seoMetadata(page.path, {
		title: page.title,
		alternates: { canonical: "/blog/" },
	});
}

/** Posts are cached ("post-list"), so the whole index prerenders */
export default function Page() {
	return (
		<>
			<SeoSchema path={page.path} />
			<BlogIndex page={1} />
		</>
	);
}
