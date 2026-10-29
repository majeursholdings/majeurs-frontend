import { getRankMathHead } from "@/lib/seo";

type SeoSchemaProps = {
	/** path on this site, as passed to seoMetadata() */
	path: string;
	/** JSON-LD to use while Rank Math's headless endpoint is off */
	fallback?: unknown;
};

/** Rank Math's JSON-LD for the page (product, article, breadcrumbs, organisation…), else `fallback`. */
export async function SeoSchema({ path, fallback }: SeoSchemaProps) {
	const head = await getRankMathHead(path);
	const schemas = head?.schemas.length ? head.schemas : fallback ? [fallback] : [];
	return schemas.map((schema, i) => (
		<script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
	));
}

export default SeoSchema;
