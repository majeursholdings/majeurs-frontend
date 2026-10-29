/**
 * Content group: everything editors manage in wp-admin (pages, blog, policies, thank-you pages).
 * Shared content providers (e.g. a preview banner for WP draft mode) go here.
 * The visible shells live in the nested (landing), (blog), (legal) and (confirmation) layouts.
 */
export default function ContentLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
