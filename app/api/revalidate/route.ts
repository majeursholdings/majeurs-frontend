import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/**
 * Called by WordPress when content is saved (docs/wordpress/majeurs-content.php):
 *   POST /api/revalidate/  { "secret": "…", "tags": ["page:about-majeurs-holdings", "seo:/about-majeurs-holdings/"] }
 * Tags are the ones the data layer caches under (lib/api/*, lib/content/get.ts, lib/seo.ts).
 */
export async function POST(request: Request) {
	const secret = process.env.REVALIDATE_SECRET;
	const body: { secret?: unknown; tags?: unknown } | null = await request.json().catch(() => null);
	if (!secret || typeof body?.secret !== "string" || !sameSecret(body.secret, secret)) {
		return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
	}
	const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string" && t.length > 0 && t.length <= 256) : [];
	if (!tags.length) return Response.json({ ok: false, error: "no tags" }, { status: 400 });

	// expire: 0 so the editor who just saved sees the change on the next load, not one load later (stale-while-revalidate)
	for (const tag of tags) revalidateTag(tag, { expire: 0 });
	return Response.json({ ok: true, tags });
}

function sameSecret(given: string, expected: string): boolean {
	const a = Buffer.from(given);
	const b = Buffer.from(expected);
	return a.length === b.length && timingSafeEqual(a, b);
}
