import { getPageContent } from "@/lib/content/get";
import type { PageContent, RichField, TextField } from "@/lib/content/model";

export type LegalFields = { title: TextField; lastUpdated: TextField; body: RichField };

/**
 * Policy page (privacy, cookies, terms, shipping, returns) inside the (legal) layout's reading column.
 * Copy from the page's fields in wp-admin (lib/content/pages/<id>.ts).
 */
export default async function LegalPage({ page }: { page: PageContent<LegalFields> }) {
	const c = await getPageContent(page);
	return (
		<>
			<h1 className="text-h2 font-normal text-black">{c.title}</h1>
			{c.lastUpdated ? <p className="text-sm text-grey">{c.lastUpdated}</p> : null}
			{/* WP editor content, written by Majeurs staff in wp-admin */}
			{c.body ? (
				<div
					className="prose-majeurs text-charcoal [&_h2]:text-h4 [&_h2]:font-normal [&_h2]:text-black [&_h3]:text-lg [&_h3]:font-normal [&_h3]:text-black"
					dangerouslySetInnerHTML={{ __html: c.body }}
				/>
			) : null}
		</>
	);
}
