import { sitemapIndexXml, xmlResponse } from "@/lib/routes/sitemaps";

export function GET() {
	return xmlResponse(sitemapIndexXml());
}
