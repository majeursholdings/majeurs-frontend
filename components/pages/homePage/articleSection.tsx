import SectionWrapper from "@/components/common/sectionWrapper";
import { PrimaryLink } from "@/components/common/btn";
import BlogCard from "@/components/common/blogCard";
import { getLatestPosts } from "@/lib/api/posts";
import { getPageContent } from "@/lib/content/get";
import { paragraphs } from "@/lib/content/model";
import { home } from "@/lib/content/pages/home";

export default async function ArticleSection() {
  const [latestPosts, c] = await Promise.all([getLatestPosts(4).catch(() => []), getPageContent(home)]);
  if (!latestPosts.length) return null;
  return (
    <SectionWrapper className="bg-sand-50">
      <div className="space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-2.5 md:gap-5">
          <div className="space-y-2">
            <h2 className="font-bold text-[28px] leading-[1.5em]">{c.journalTitle}</h2>
            {paragraphs(c.journalText).map((p) => (
              <p key={p} className="text-sm text-ink">
                {p}
              </p>
            ))}
          </div>
          <PrimaryLink
            slug={c.journalCta.href}
            label={c.journalCta.label}
            colorClassName="border-ink text-ink"
            hoverClassName="hover:bg-ink hover:text-sand"
          />
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {latestPosts.map((post) => (
            <BlogCard key={post.href} {...post} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
