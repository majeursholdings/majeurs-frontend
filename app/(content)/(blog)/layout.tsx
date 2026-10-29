/**
 * Blog index, posts and category archives. WP design: full-width title banner, then the sidebar
 * (search, featured posts, categories or share links, Atunlo banner) on the left and the content on the
 * right; the sidebar drops below the content under 1025px.
 *
 * Pages place their parts on the grid, in this order so the sidebar follows the content on mobile:
 *   <PageHero className="col-full" … />
 *   <div className="col-main">…</div>
 *   <aside className="col-aside"><BlogSidebar /></aside>
 *   then any full-width band (CTA, comments) with col-full
 */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <div className="layout-sidebar">{children}</div>;
}
