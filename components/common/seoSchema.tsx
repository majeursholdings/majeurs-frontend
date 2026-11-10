import { getContact } from "@/lib/content/get";
import { getRankMathHead } from "@/lib/seo";

type SeoSchemaProps = {
	/** path on this site, as passed to seoMetadata() */
	path: string;
	/** JSON-LD to use while Rank Math's headless endpoint is off */
	fallback?: unknown;
	/**
	 * Replaces Rank Math's main entity (its `#richSnippet` node), keeping that node's @id and mainEntityOfPage.
	 * For what the headless endpoint can't build, e.g. a variable product's ProductGroup (getHead only returns a plain Product).
	 */
	mainEntity?: Record<string, unknown>;
};

type Graph = { "@graph"?: Record<string, unknown>[] };

/**
 * Rank Math's JSON-LD for the page (product, article, breadcrumbs, organisation…), else `fallback`. Every `telephone`
 * is the Contact details number (wp-admin > Site content), whatever Rank Math's Local SEO settings hold.
 */
export async function SeoSchema({ path, fallback, mainEntity }: SeoSchemaProps) {
	const [head, contact] = await Promise.all([getRankMathHead(path), getContact()]);
	const telephone = contact.phone.href.replace("tel:", "");
	const schemas = (head?.schemas.length ? head.schemas.map((schema) => (mainEntity ? withMainEntity(schema, mainEntity) : schema)) : fallback ? [fallback] : []).map(
		(schema) => withTelephone(schema, telephone),
	);
	return schemas.map((schema, i) => (
		<script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
	));
}

function withMainEntity(schema: unknown, entity: Record<string, unknown>): unknown {
	const graph = (schema as Graph)["@graph"];
	if (!Array.isArray(graph)) return schema;
	const i = graph.findIndex((node) => typeof node["@id"] === "string" && node["@id"].endsWith("#richSnippet"));
	if (i === -1) return schema;
	const next = [...graph];
	// the graph carries the @context
	next[i] = { ...entity, "@context": undefined, "@id": graph[i]["@id"], mainEntityOfPage: graph[i].mainEntityOfPage };
	return { ...(schema as object), "@graph": next };
}

/** Replaces every `telephone` value in a schema tree */
function withTelephone(value: unknown, telephone: string): unknown {
	if (Array.isArray(value)) return value.map((v) => withTelephone(v, telephone));
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === "telephone" && typeof v === "string" ? telephone : withTelephone(v, telephone)]));
}

export default SeoSchema;
