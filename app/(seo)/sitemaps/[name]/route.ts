import { sitemapXml, xmlResponse } from "@/lib/routes/sitemaps";

/** Serves /<name>-sitemap.xml via the rewrite in next.config.ts */
export async function GET(_req: Request, { params }: RouteContext<"/sitemaps/[name]">) {
	const { name } = await params;
	const xml = sitemapXml(name);
	return xml ? xmlResponse(xml) : new Response("Not found", { status: 404 });
}
