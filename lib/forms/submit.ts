"use server";

import { headers } from "next/headers";
import { getErrorMessage } from "@/lib/api";
import type { ActionResult } from "@/lib/account/schemas";
import { EnquiryError, sendEnquiry } from "@/lib/api/forms";
import { UploadError, filesFrom, uploadToWordPress } from "@/lib/api/media";
import { enquiryAction, type RecaptchaProof } from "@/lib/recaptcha/client";
import { checkRecaptcha, recaptchaRejected } from "@/lib/recaptcha/server";
import { ENQUIRY_MAX_FILES, enquiries, type EnquiryDefinition, type EnquiryId } from "./enquiries";

/**
 * Every enquiry form posts here with toFormData(values) and reCAPTCHA proof (useRecaptcha(enquiryAction(form))).
 * Validates against the form's schema, checks reCAPTCHA, drops bot submissions (honeypot), uploads files to
 * WP media, then sends the enquiry to WordPress.
 * Returns `redirect` when the form has a thank-you page, so the client can navigate after its toast.
 */
export async function submitEnquiryAction(form: EnquiryId, data: FormData, recaptcha: RecaptchaProof): Promise<ActionResult & { redirect?: string }> {
	const definition: EnquiryDefinition | undefined = enquiries[form];
	if (!definition) return { ok: false, message: "Unknown form." };

	// FormData -> plain values; array fields (checkbox groups) keep every value
	const values: Record<string, unknown> = {};
	for (const key of new Set(data.keys())) {
		if (definition.uploads?.some((u) => u.field === key)) continue;
		const all = data.getAll(key).filter((v): v is string => typeof v === "string");
		values[key] = definition.arrays?.includes(key) ? all : all[0];
	}

	const parsed = definition.schema.safeParse(values);
	if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
	const fields = parsed.data as Record<string, unknown>;

	const check = await checkRecaptcha(recaptcha, enquiryAction(form));
	if (check !== "ok") return recaptchaRejected(check);

	// a filled honeypot is a bot: pretend it worked
	if (fields.website) return { ok: true, message: definition.successMessage, redirect: definition.successPath };

	const uploads = (definition.uploads ?? []).map((u) => ({ ...u, files: filesFrom(data, u.field) }));
	const missing = uploads.find((u) => u.required && !u.files.length);
	if (missing) return { ok: false, message: `Please attach your ${missing.label.toLowerCase()}.` };
	if (uploads.some((u) => u.files.length > ENQUIRY_MAX_FILES)) return { ok: false, message: `Attach up to ${ENQUIRY_MAX_FILES} files per field.` };

	try {
		// one upload at a time per field, so a bad file fails before the next field's files go up
		const media = [];
		for (const u of uploads) if (u.files.length) media.push(...(await uploadToWordPress(u.files, u.purpose)));
		const text = (value: unknown) => (Array.isArray(value) ? value.join(", ") : String(value ?? ""));
		const name = [fields.first_name, fields.last_name].filter(Boolean).join(" ");

		await sendEnquiry(form, {
			title: definition.title,
			fields: Object.entries(definition.labels)
				.map(([key, label]) => ({ key, label, value: text(fields[key]) }))
				.filter((f) => f.value),
			replyTo: text(fields[definition.replyTo]),
			name,
			subscribe: definition.marketingOptIn !== false && fields.marketing_opt_in === true,
			attachments: media.map((m) => m.id),
			page: (await headers()).get("referer") ?? undefined,
		});

		return { ok: true, message: definition.successMessage, redirect: definition.successPath };
	} catch (error) {
		if (!(error instanceof UploadError || error instanceof EnquiryError)) console.error(error);
		return { ok: false, message: getErrorMessage(error) };
	}
}
