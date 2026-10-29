import { BlogSidebar } from "./blogSidebar";
import { PostArchive } from "./postArchive";
import { DEFAULT_HERO_IMAGE, PageHero } from "@/components/common/pageHero";
import { CustomizeCta } from "@/components/marketing/customizeCta";

/** /blog/ and /blog/page/<n>/ */
export function BlogIndex({ page }: { page: number }) {
	return (
		<>
			<PageHero className="col-full" title="Blogs and News" />
			<div className="col-main">
				<PostArchive page={page} basePath="/blog/" />
			</div>
			<aside aria-label="Blog" className="col-aside">
				<BlogSidebar />
			</aside>
			<CustomizeCta className="col-full" image={DEFAULT_HERO_IMAGE} fullBleed />
		</>
	);
}
