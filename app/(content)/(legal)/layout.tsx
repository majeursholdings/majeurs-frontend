/**
 * Policy documents (shipping, returns, privacy, cookies, terms). Narrow reading column
 * with the long-form text styles; the page renders its own <h1> and WP content.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="container-site py-12.5 md:py-20">
			<article className="prose-majeurs mx-auto max-w-3xl">{children}</article>
		</div>
	);
}
