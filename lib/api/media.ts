import { DEFAULT_MAX_FILE_SIZE_MB } from "@/components/customForm/fileRules";
import { WP_API, wpFetch } from "./wp";

/**
 * Server-only: adds form files to the WordPress media library. Called by each form's own route
 * handler after it has validated the submission; the browser never uploads anything itself.
 * Uses a WordPress Application Password (WP_UPLOAD_USER / WP_UPLOAD_APP_PASSWORD) for a dedicated
 * low-privilege user with the upload_files capability (e.g. Author).
 */

/** What a form's files are for, each with the file types it accepts */
export const UPLOAD_PURPOSES = {
	"trade-document": ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp"],
	"custom-order-reference": ["jpg", "jpeg", "png", "webp", "heic", "pdf"],
	"contact-attachment": ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"],
	"review-attachment": ["jpg", "jpeg", "png", "webp"],
	"job-application": ["pdf", "jpg", "jpeg", "png"],
} as const;

export type UploadPurpose = keyof typeof UPLOAD_PURPOSES;

export type MediaItem = { id: number; url: string; name: string };

export class UploadError extends Error {}

/** Files posted under `name` (from toFormData), ignoring empty parts. */
export function filesFrom(formData: FormData, name: string): File[] {
	return formData.getAll(name).filter((v): v is File => v instanceof File && v.size > 0);
}

/** Checks every file first, then uploads them all; throws UploadError with a message safe to show. */
export async function uploadToWordPress(files: File[], purpose: UploadPurpose): Promise<MediaItem[]> {
	const { WP_UPLOAD_USER: user, WP_UPLOAD_APP_PASSWORD: password } = process.env;
	if (!user || !password) throw new UploadError("File uploads aren't set up yet.");

	const formats: readonly string[] = UPLOAD_PURPOSES[purpose];
	for (const file of files) {
		const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
		if (!formats.includes(extension)) throw new UploadError(`${file.name}: only ${formats.join(", ").toUpperCase()} files are accepted.`);
		if (file.size > DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024) throw new UploadError(`${file.name}: files must be under ${DEFAULT_MAX_FILE_SIZE_MB}MB.`);
	}

	const auth = `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
	return Promise.all(
		files.map(async (file) => {
			const body = new FormData();
			body.append("file", file, file.name);
			body.append("title", file.name);
			body.append("caption", `Website form upload (${purpose})`);

			const res = await wpFetch(`${WP_API}/media`, { method: "POST", headers: { Authorization: auth }, body });
			const media = await res.json().catch(() => null);
			if (!res.ok || !media?.id) {
				console.error("WP media upload failed", res.status, media?.code, media?.message);
				throw new UploadError(`${file.name} couldn't be uploaded. Please try again.`);
			}
			return { id: media.id as number, url: media.source_url as string, name: file.name };
		}),
	);
}
