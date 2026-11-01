import { WP_URL } from "@/lib/api/wp";

/** WP hosts the catalogue PDFs may live on (same as next.config.ts images.remotePatterns) */
const hosts = new Set(["majeurs.com", "cms.majeurs.com", "api.majeurs.com", new URL(WP_URL).hostname]);

/**
 * GET /api/catalogue/download/?url=<PDF in WP uploads>
 * Serves the PDF as an attachment from our own origin: browsers ignore <a download> on cross-origin links
 * and open the PDF in a tab instead. Only PDFs in WP uploads, so this isn't an open proxy.
 */
export async function GET(request: Request) {
	const raw = new URL(request.url).searchParams.get("url") ?? "";
	const src = URL.canParse(raw) ? new URL(raw) : null;
	if (!src || src.protocol !== "https:" || !hosts.has(src.hostname) || !src.pathname.startsWith("/wp-content/uploads/") || !src.pathname.toLowerCase().endsWith(".pdf")) {
		return Response.json({ ok: false, error: "not a catalogue" }, { status: 400 });
	}

	const upstream = await fetch(src, { cache: "no-store" });
	if (!upstream.ok || !upstream.body) return Response.json({ ok: false, error: "not found" }, { status: 404 });

	const filename = decodeURIComponent(src.pathname.split("/").pop() ?? "catalogue.pdf").replace(/["\\\r\n]/g, "");
	const headers = new Headers({
		"Content-Type": "application/pdf",
		"Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
		"Cache-Control": "public, max-age=3600",
	});
	const length = upstream.headers.get("content-length");
	if (length) headers.set("Content-Length", length);
	return new Response(upstream.body, { headers });
}
