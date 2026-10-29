/**
 * MainForm values -> FormData for a form's server route, so picked files travel with the submit
 * (nothing is uploaded from the browser). Files and file lists are appended under the field name,
 * saved files and other objects as JSON, everything else as text.
 *
 *   await fetch("/api/trade-program/", { method: "POST", body: toFormData(values) });
 *
 * The route reads files back with formData.getAll("documents") and uploads them with lib/api/media.ts.
 */
export function toFormData(values: Record<string, unknown>): FormData {
	const data = new FormData();
	for (const [key, value] of Object.entries(values)) {
		if (value === undefined || value === null) continue;
		const list = Array.isArray(value) ? value : [value];
		for (const item of list) {
			if (item instanceof Blob) data.append(key, item);
			else if (item instanceof Date) data.append(key, item.toISOString());
			else if (typeof item === "object") data.append(key, JSON.stringify(item));
			else data.append(key, String(item));
		}
	}
	return data;
}
